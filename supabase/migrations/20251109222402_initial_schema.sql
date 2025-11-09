-- 그리다, 폼 데이터베이스 스키마
-- Supabase에서 실행할 SQL 스크립트

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 프로젝트 멤버 테이블 (사용자 초대 및 권한 관리)
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 설문 폼 테이블
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  data JSONB, -- 설문 폼 데이터 (질문, 옵션 등)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 프로젝트 초대 테이블 (이메일 기반 초대)
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- 휴지통 테이블
CREATE TABLE IF NOT EXISTS trash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('project', 'form')),
  item_id UUID NOT NULL,
  item_data JSONB NOT NULL, -- 삭제된 항목의 전체 데이터 저장
  deleted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  restored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_type, item_id, deleted_at) -- 같은 항목이 여러 번 삭제될 수 있도록 deleted_at 포함
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_project_id ON forms(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email ON project_invitations(email);

-- deleted_at 필드 인덱스 생성 (소프트 삭제된 항목 제외 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_forms_deleted_at ON forms(deleted_at) WHERE deleted_at IS NULL;

-- 휴지통 테이블 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_trash_deleted_by ON trash(deleted_by);
CREATE INDEX IF NOT EXISTS idx_trash_item_type ON trash(item_type);
CREATE INDEX IF NOT EXISTS idx_trash_item_id ON trash(item_id);
CREATE INDEX IF NOT EXISTS idx_trash_deleted_at ON trash(deleted_at);
CREATE INDEX IF NOT EXISTS idx_trash_restored_at ON trash(restored_at);

-- RLS (Row Level Security) 정책 설정

-- 프로젝트 테이블 RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 프로젝트 소유자는 자신의 프로젝트를 볼 수 있음 (삭제된 항목 포함)
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = owner_id and deleted_at IS NULL);

-- 프로젝트 멤버는 자신이 참여한 프로젝트를 볼 수 있음 (삭제되지 않은 항목만)
CREATE POLICY "Users can view projects they are members of"
  ON projects FOR SELECT
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  );

-- 사용자는 자신의 프로젝트를 생성할 수 있음
CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- 프로젝트 소유자는 자신의 프로젝트를 수정할 수 있음 (소프트 삭제 허용)
CREATE POLICY "Project owners can update their projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id and deleted_at IS NULL)
  WITH CHECK (auth.uid() = owner_id);

-- 프로젝트 소유자는 자신의 프로젝트를 삭제할 수 있음
CREATE POLICY "Project owners can delete their projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- 프로젝트 멤버 테이블 RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신이 참여한 프로젝트의 멤버를 볼 수 있음
CREATE POLICY "Users can view members of their projects"
  ON project_members FOR SELECT
  USING (user_id = auth.uid());

-- 프로젝트 소유자는 멤버를 추가할 수 있음
CREATE POLICY "Project owners can add members"
  ON project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );

-- 프로젝트 소유자는 멤버를 삭제할 수 있음
CREATE POLICY "Project owners can remove members"
  ON project_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );

-- 설문 폼 테이블 RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신이 접근 권한이 있는 프로젝트의 설문 폼을 볼 수 있음 (삭제되지 않은 항목만)
CREATE POLICY "Users can view forms in their projects"
  ON forms FOR SELECT
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = forms.project_id
      AND projects.deleted_at IS NULL
      AND (
        projects.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.user_id = auth.uid()
        )
      )
    )
  );

-- 사용자는 자신이 접근 권한이 있는 프로젝트에 설문 폼을 생성할 수 있음
CREATE POLICY "Users can create forms in their projects"
  ON forms FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = forms.project_id
      AND projects.deleted_at IS NULL
      AND (
        projects.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.user_id = auth.uid()
        )
      )
    )
  );

-- 사용자는 자신이 접근 권한이 있는 프로젝트의 설문 폼을 수정할 수 있음 (소프트 삭제 허용)
CREATE POLICY "Users can update forms in their projects"
  ON forms FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = forms.project_id
      AND projects.deleted_at IS NULL
      AND (
        projects.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.user_id = auth.uid()
        )
      )
    )
  );

-- 사용자는 자신이 접근 권한이 있는 프로젝트의 설문 폼을 삭제할 수 있음
CREATE POLICY "Users can delete forms in their projects"
  ON forms FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = forms.project_id
      AND (
        projects.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.user_id = auth.uid()
        )
      )
    )
  );

-- 프로젝트 초대 테이블 RLS
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- 프로젝트 소유자는 자신의 프로젝트 초대를 볼 수 있음
CREATE POLICY "Project owners can view invitations"
  ON project_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_invitations.project_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );

-- 프로젝트 소유자는 초대를 생성할 수 있음
CREATE POLICY "Project owners can create invitations"
  ON project_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_invitations.project_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );

-- 휴지통 테이블 RLS
ALTER TABLE trash ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신이 삭제한 항목만 볼 수 있음
CREATE POLICY "Users can view their own trash"
  ON trash FOR SELECT
  USING (deleted_by = auth.uid());

-- 사용자는 자신의 휴지통 항목을 원복할 수 있음
CREATE POLICY "Users can restore their trash"
  ON trash FOR UPDATE
  USING (deleted_by = auth.uid() AND restored_at IS NULL)
  WITH CHECK (deleted_by = auth.uid());

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 프로젝트 삭제 시 휴지통에 추가하는 함수
CREATE OR REPLACE FUNCTION move_project_to_trash()
RETURNS TRIGGER AS $$
BEGIN
  -- 프로젝트가 삭제될 때 (deleted_at이 설정될 때) 휴지통에 추가
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    INSERT INTO trash (item_type, item_id, item_data, deleted_by, deleted_at)
    VALUES (
      'project',
      NEW.id,
      jsonb_build_object(
        'id', NEW.id,
        'name', NEW.name,
        'description', NEW.description,
        'owner_id', NEW.owner_id,
        'created_at', NEW.created_at,
        'updated_at', NEW.updated_at
      ),
      auth.uid(),
      NEW.deleted_at
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 폼 삭제 시 휴지통에 추가하는 함수
CREATE OR REPLACE FUNCTION move_form_to_trash()
RETURNS TRIGGER AS $$
BEGIN
  -- 폼이 삭제될 때 (deleted_at이 설정될 때) 휴지통에 추가
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    INSERT INTO trash (item_type, item_id, item_data, deleted_by, deleted_at)
    VALUES (
      'form',
      NEW.id,
      jsonb_build_object(
        'id', NEW.id,
        'name', NEW.name,
        'project_id', NEW.project_id,
        'data', NEW.data,
        'created_at', NEW.created_at,
        'updated_at', NEW.updated_at
      ),
      auth.uid(),
      NEW.deleted_at
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 프로젝트 삭제 트리거
CREATE TRIGGER trigger_move_project_to_trash
  AFTER UPDATE OF deleted_at ON projects
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION move_project_to_trash();

-- 폼 삭제 트리거
CREATE TRIGGER trigger_move_form_to_trash
  AFTER UPDATE OF deleted_at ON forms
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION move_form_to_trash();

-- 프로젝트 삭제 함수 (소프트 삭제)
CREATE OR REPLACE FUNCTION delete_project(project_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  project_owner UUID;
  deleted_count INTEGER;
BEGIN
  -- 프로젝트 소유자 확인
  SELECT owner_id INTO project_owner
  FROM projects
  WHERE id = project_id
    AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- 소유자 확인
  IF project_owner != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  -- 프로젝트 소프트 삭제 (deleted_at 설정)
  UPDATE projects
  SET deleted_at = NOW()
  WHERE id = project_id
    AND deleted_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count > 0 THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 폼 삭제 함수 (소프트 삭제)
CREATE OR REPLACE FUNCTION delete_form(form_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  form_project_id UUID;
  deleted_count INTEGER;
BEGIN
  -- 폼의 프로젝트 ID 확인
  SELECT project_id INTO form_project_id
  FROM forms
  WHERE id = form_id
    AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- 프로젝트 접근 권한 확인
  IF NOT EXISTS (
    SELECT 1 FROM projects
    WHERE id = form_project_id
      AND deleted_at IS NULL
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.user_id = auth.uid()
        )
      )
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- 폼 소프트 삭제 (deleted_at 설정)
  UPDATE forms
  SET deleted_at = NOW()
  WHERE id = form_id
    AND deleted_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count > 0 THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 원복 함수 생성
CREATE OR REPLACE FUNCTION restore_from_trash(trash_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  trash_item trash%ROWTYPE;
  restored_count INTEGER;
BEGIN
  -- 휴지통 항목 조회
  SELECT * INTO trash_item
  FROM trash
  WHERE id = trash_id
    AND deleted_by = auth.uid()
    AND restored_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- 항목 타입에 따라 원복
  IF trash_item.item_type = 'project' THEN
    UPDATE projects
    SET deleted_at = NULL
    WHERE id = trash_item.item_id
      AND deleted_at IS NOT NULL;
    
    GET DIAGNOSTICS restored_count = ROW_COUNT;
    
    IF restored_count > 0 THEN
      -- 휴지통 항목에 원복 시간 기록
      UPDATE trash
      SET restored_at = NOW()
      WHERE id = trash_id;
      RETURN TRUE;
    END IF;
    
  ELSIF trash_item.item_type = 'form' THEN
    UPDATE forms
    SET deleted_at = NULL
    WHERE id = trash_item.item_id
      AND deleted_at IS NOT NULL;
    
    GET DIAGNOSTICS restored_count = ROW_COUNT;
    
    IF restored_count > 0 THEN
      -- 휴지통 항목에 원복 시간 기록
      UPDATE trash
      SET restored_at = NOW()
      WHERE id = trash_id;
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

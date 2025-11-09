"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon, LucideIcon } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import { Checkbox } from "./checkbox";

// Modal Root
function Modal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="modal" {...props} />;
}

// Modal Trigger
function ModalTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="modal-trigger" {...props} />;
}

// Modal Portal
const ModalPortal = ({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) => {
  return <DialogPrimitive.Portal data-slot="modal-portal" {...props} />;
};
ModalPortal.displayName = "ModalPortal";

// Modal Close
function ModalClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="modal-close" {...props} />;
}

// Modal Overlay - Figma 디자인에 맞춘 스타일
const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      data-slot="modal-overlay"
      ref={ref}
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-[rgba(10,13,18,0.7)] backdrop-blur-md",
        className,
      )}
      {...props}
    />
  );
});
ModalOverlay.displayName = "ModalOverlay";

// Modal Content - Figma 디자인에 맞춘 스타일 (데스크톱/모바일 대응)
interface ModalContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
  width?: "sm" | "md" | "lg" | "xl" | "full";
  mobilePosition?: "bottom" | "center"; // 모바일에서 하단 또는 중앙 배치
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, children, showCloseButton = true, width = "md", mobilePosition = "center", ...props }, ref) => {
  const widthClasses = {
    sm: "max-w-[320px]",
    md: "max-w-[400px]",
    lg: "max-w-[512px]",
    xl: "max-w-[640px]",
    full: "max-w-[calc(100%-2rem)]",
  };

  return (
    <ModalPortal data-slot="modal-portal">
      <ModalOverlay />
      <DialogPrimitive.Content
        data-slot="modal-content"
        ref={ref}
        className={cn(
          // 기본 스타일
          "bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed z-50 w-full rounded-2xl shadow-xl duration-200",
          "shadow-[0px_8px_8px_-4px_rgba(10,13,18,0.04),0px_20px_24px_-4px_rgba(10,13,18,0.1)]",
          // 데스크톱: 중앙 위치
          "top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]",
          widthClasses[width],
          // 모바일: Figma 디자인에 따라 하단 배치 (기본값)
          mobilePosition === "bottom" && [
            "max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:translate-x-0 max-sm:translate-y-0",
            "max-sm:max-w-full max-sm:rounded-b-none max-sm:rounded-t-2xl",
            "max-sm:pb-5", // 하단 패딩 추가 (Figma: 80px는 전체 컨테이너 패딩)
          ],
          // 모바일: 중앙 배치 (선택적)
          mobilePosition === "center" && [
            "max-sm:top-[50%] max-sm:left-[50%] max-sm:translate-x-[-50%] max-sm:translate-y-[-50%]",
            "max-sm:max-w-[calc(100%-2rem)]",
          ],
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </ModalPortal>
  );
});
ModalContent.displayName = "ModalContent";

// Modal Header - Figma 디자인에 맞춘 스타일
interface ModalHeaderProps extends React.ComponentProps<"div"> {
  align?: "left" | "center" | "right";
  showCloseButton?: boolean;
  featuredIcon?: React.ReactNode;
  showDivider?: boolean;
  paddingBottom?: boolean;
}

function ModalHeader({
  className,
  align = "center",
  showCloseButton = true,
  featuredIcon,
  showDivider = false,
  paddingBottom = false,
  children,
  ...props
}: ModalHeaderProps) {
  const isHorizontal = align === "left" && featuredIcon;
  const isCenter = align === "center";

  return (
    <div
      data-slot="modal-header"
      className={cn(
        "relative",
        // 데스크톱: 24px 패딩
        "px-6 pt-6",
        // 모바일: 16px 패딩
        "max-sm:px-4 max-sm:pt-5",
        paddingBottom && "pb-5 max-sm:pb-4",
        showDivider && "border-b border-[#E9EAEB] pb-6 max-sm:pb-4",
        className,
      )}
      {...props}
    >
      {/* Horizontal layout (left aligned with icon) */}
      {isHorizontal ? (
        <div className="flex items-start gap-3">
          {featuredIcon && (
            <div className="shrink-0 mt-0.5">{featuredIcon}</div>
          )}
          <div className="flex flex-col gap-1 flex-1 text-left">
            {children}
          </div>
          {showCloseButton && (
            <DialogPrimitive.Close className="shrink-0 rounded-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none p-1.5 -mt-1 -mr-1">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </div>
      ) : (
        <>
          {/* Center aligned or right aligned */}
          <div
            className={cn(
              "flex flex-col gap-1",
              align === "center" && "items-center text-center",
              align === "right" && "items-end text-right",
              align === "left" && "items-start text-left",
            )}
          >
            {children}
          </div>
          {/* Close button for center/right aligned */}
          {showCloseButton && !featuredIcon && (
            <DialogPrimitive.Close className="absolute top-4 right-4 rounded-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none p-1.5">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
          {/* Featured icon for center aligned */}
          {featuredIcon && isCenter && (
            <div className="flex justify-center mt-2">
              {featuredIcon}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Modal Title - Figma 디자인에 맞춘 스타일
function ModalTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="modal-title"
      className={cn(
        "text-lg font-semibold leading-[1.5555555555555556em] text-[#101828]",
        className,
      )}
      {...props}
    />
  );
}

// Modal Description - Figma 디자인에 맞춘 스타일
function ModalDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="modal-description"
      className={cn(
        "text-sm font-normal leading-[1.4285714285714286em] text-[#475467] mb-2",
        className,
      )}
      {...props}
    />
  );
}

// Modal Body - Figma 디자인에 맞춘 스타일 (모바일 대응)
function ModalBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-body"
      className={cn(
        "flex flex-col gap-5",
        // 데스크톱: 24px 패딩
        "px-6 pt-0",
        // 모바일: 16px 패딩
        "max-sm:px-4",
        className,
      )}
      {...props}
    />
  );
}

// Modal Footer - Figma 디자인에 맞춘 스타일 (모바일 대응)
interface ModalFooterProps extends React.ComponentProps<"div"> {
  align?: "left" | "center" | "right" | "stretch";
  showDivider?: boolean;
}

function ModalFooter({
  className,
  align = "stretch",
  showDivider = false,
  ...props
}: ModalFooterProps) {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    stretch: "justify-stretch",
  };

  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "flex gap-3",
        // 데스크톱: 가로 배치, 24px 패딩
        "flex-row px-6 pb-6 pt-8",
        // 모바일: 세로 배치, 16px 패딩
        "max-sm:flex-col max-sm:px-4 max-sm:pb-4 max-sm:pt-6",
        alignClasses[align],
        showDivider && "border-t border-[#E9EAEB] pt-6 max-sm:pt-6",
        className,
      )}
      {...props}
    />
  );
}

// Featured Icon Component - Figma 디자인에 맞춘 스타일
interface FeaturedIconProps {
  icon: LucideIcon;
  variant?: "success" | "warning" | "error" | "primary";
  className?: string;
}

function FeaturedIcon({ icon: Icon, variant = "primary", className }: FeaturedIconProps) {
  const variantClasses = {
    success: "bg-[#ECFDF3] border-[#A6F4C5] text-[#027A48]",
    warning: "bg-[#FFFAEB] border-[#FEDF89] text-[#B93815]",
    error: "bg-[#FEF3F2] border-[#FEC84B] text-[#B42318]",
    primary: "bg-[#F4EBFF] border-[#D6BBFB] text-[#7F56D9]",
  };

  return (
    <div
      className={cn(
        "w-14 h-14 rounded-[28px] border-2 flex items-center justify-center shrink-0",
        variantClasses[variant],
        className,
      )}
    >
      <Icon className="size-6" />
    </div>
  );
}

// Modal Actions - Figma 디자인에 맞춘 버튼 그룹
interface ModalActionsProps extends React.ComponentProps<"div"> {
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  cancelVariant?: "outline" | "ghost" | "destructive";
  confirmVariant?: "default" | "destructive";
  isLoading?: boolean;
  disabled?: boolean;
  showCancel?: boolean;
  showConfirm?: boolean;
  confirmType?: "button" | "submit";
  showCheckbox?: boolean;
  checkboxLabel?: string;
  checkboxChecked?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  showTertiaryButton?: boolean;
  tertiaryLabel?: string;
  onTertiaryClick?: () => void;
  layout?: "horizontal" | "vertical" | "horizontal-right" | "horizontal-fill";
  showDivider?: boolean;
}

function ModalActions({
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
  cancelVariant = "outline",
  confirmVariant = "default",
  isLoading = false,
  disabled = false,
  showCancel = true,
  showConfirm = true,
  confirmType = "button",
  showCheckbox = false,
  checkboxLabel = "Don't show again",
  checkboxChecked = false,
  onCheckboxChange,
  showTertiaryButton = false,
  tertiaryLabel = "Tertiary",
  onTertiaryClick,
  layout = "horizontal",
  showDivider = false,
  className,
  ...props
}: ModalActionsProps) {
  const isVertical = layout === "vertical";
  const isHorizontalRight = layout === "horizontal-right";
  const isHorizontalFill = layout === "horizontal-fill";

  return (
    <ModalFooter
      className={className}
      showDivider={showDivider}
      align={isVertical || isHorizontalFill ? "stretch" : isHorizontalRight ? "right" : "stretch"}
      {...props}
    >
      {/* Checkbox (only for horizontal-right layout) */}
      {showCheckbox && isHorizontalRight && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={checkboxChecked}
            onCheckedChange={(checked) => onCheckboxChange?.(checked === true)}
          />
          <label className="text-sm font-medium text-[#344054] cursor-pointer">
            {checkboxLabel}
          </label>
        </div>
      )}

      {/* Actions container */}
      <div
        className={cn(
          "flex gap-3",
          isVertical ? "flex-col w-full" : "flex-row",
          isHorizontalRight && showCheckbox && "ml-auto",
          isHorizontalFill && "w-full",
        )}
      >
        {/* Tertiary button */}
        {showTertiaryButton && (
          <Button
            type="button"
            variant="ghost"
            onClick={onTertiaryClick}
            disabled={isLoading || disabled}
            className={cn(isHorizontalFill && "flex-1")}
          >
            {tertiaryLabel}
          </Button>
        )}

        {/* Cancel button */}
        {showCancel && (
          <Button
            type="button"
            variant={cancelVariant}
            onClick={onCancel}
            disabled={isLoading || disabled}
            className={cn(
              cancelVariant === "outline" &&
              "border-[#D0D5DD] text-[#344054] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#F9FAFB]",
              isHorizontalFill ? "flex-1" : "flex-1",
              // 모바일: 순서 변경을 위해 order 적용
              "max-sm:order-2",
            )}
          >
            {cancelLabel}
          </Button>
        )}

        {/* Confirm button */}
        {showConfirm && (
          <Button
            type={confirmType}
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isLoading || disabled}
            className={cn(
              confirmVariant === "default" &&
              "bg-[#7F56D9] text-white border-[#7F56D9] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#6941C6]",
              confirmVariant === "destructive" &&
              "bg-[#D92D20] text-white border-[#D92D20] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#B42318]",
              isHorizontalFill ? "flex-1" : "flex-1",
              // 모바일: 순서 변경을 위해 order 적용
              "max-sm:order-1",
            )}
          >
            {isLoading ? "Loading..." : confirmLabel}
          </Button>
        )}
      </div>
    </ModalFooter>
  );
}

// Pagination Dots - Figma 디자인에 맞춘 스타일 (선택적)
interface PaginationDotsProps {
  total: number;
  current: number;
  className?: string;
}

function PaginationDots({ total, current, className }: PaginationDotsProps) {
  return (
    <div
      data-slot="modal-pagination"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "w-1.5 h-1.5 rounded-md transition-colors",
            index === current
              ? "bg-[#6941C6]"
              : "bg-[#F2F4F7]",
          )}
        />
      ))}
    </div>
  );
}

export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalClose,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalActions,
  FeaturedIcon,
  PaginationDots,
};

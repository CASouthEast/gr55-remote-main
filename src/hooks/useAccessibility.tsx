import { useCallback } from "react";
import { Platform } from "react-native";

export interface AccessibilityProps {
  accessibilityRole?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    selected?: boolean;
    disabled?: boolean;
    expanded?: boolean;
  };
  accessible?: boolean;
  tabIndex?: number;
  "aria-label"?: string;
  "aria-selected"?: boolean;
  "aria-disabled"?: boolean;
  "aria-expanded"?: boolean;
  "aria-hidden"?: boolean;
  role?: string;
}

export function useAccessibility() {
  const createTabProps = useCallback(
    (
      label: string,
      isSelected: boolean,
      isDisabled: boolean = false
    ): AccessibilityProps => {
      const baseProps: AccessibilityProps = {
        accessible: true,
        accessibilityRole: "tab",
        accessibilityLabel: `${label} tab`,
        accessibilityHint: isSelected
          ? `${label} tab is currently selected`
          : `Activate to switch to ${label} tab`,
        accessibilityState: {
          selected: isSelected,
          disabled: isDisabled,
        },
      };

      if (Platform.OS === "web") {
        return {
          ...baseProps,
          role: "tab",
          "aria-label": `${label} tab`,
          "aria-selected": isSelected,
          "aria-disabled": isDisabled,
          tabIndex: isDisabled ? -1 : 0,
        };
      }

      return baseProps;
    },
    []
  );

  const createTabListProps = useCallback(
    (label: string = "Navigation tabs"): AccessibilityProps => {
      const baseProps: AccessibilityProps = {
        accessible: true,
        accessibilityRole: "tablist",
        accessibilityLabel: label,
      };

      if (Platform.OS === "web") {
        return {
          ...baseProps,
          role: "tablist",
          "aria-label": label,
        };
      }

      return baseProps;
    },
    []
  );

  const createTabPanelProps = useCallback(
    (label: string, isActive: boolean): AccessibilityProps => {
      const baseProps: AccessibilityProps = {
        accessible: true,
        accessibilityRole: "tabpanel",
        accessibilityLabel: `${label} content`,
      };

      if (Platform.OS === "web") {
        return {
          ...baseProps,
          role: "tabpanel",
          "aria-label": `${label} content`,
          "aria-hidden": !isActive,
        };
      }

      return baseProps;
    },
    []
  );

  const announceToScreenReader = useCallback((message: string) => {
    if (Platform.OS === "web") {
      // Create a live region for screen reader announcements
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.style.position = "absolute";
      announcement.style.left = "-10000px";
      announcement.style.width = "1px";
      announcement.style.height = "1px";
      announcement.style.overflow = "hidden";

      document.body.appendChild(announcement);
      announcement.textContent = message;

      // Clean up after announcement
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    }
  }, []);

  const handleKeyboardNavigation = useCallback(
    (
      event: any,
      tabs: { key: string; title: string }[],
      activeTab: string,
      onTabChange: (tabKey: string) => void
    ) => {
      if (Platform.OS !== "web") return;

      const { key, target } = event.nativeEvent || event;

      switch (key) {
        case "ArrowLeft":
        case "ArrowRight": {
          event.preventDefault();
          const currentIndex = tabs.findIndex((tab) => tab.key === activeTab);
          let nextIndex;

          if (key === "ArrowLeft") {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          } else {
            nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          }

          const nextTab = tabs[nextIndex];
          onTabChange(nextTab.key);
          announceToScreenReader(`Switched to ${nextTab.title} tab`);

          // Focus the next tab element
          setTimeout(() => {
            const tabElements =
              target?.parentElement?.querySelectorAll('[role="tab"]');
            if (tabElements && tabElements[nextIndex]) {
              (tabElements[nextIndex] as HTMLElement).focus();
            }
          }, 0);
          break;
        }

        case "Home": {
          event.preventDefault();
          const firstTab = tabs[0];
          onTabChange(firstTab.key);
          announceToScreenReader(`Switched to ${firstTab.title} tab`);

          setTimeout(() => {
            const tabElements =
              target?.parentElement?.querySelectorAll('[role="tab"]');
            if (tabElements && tabElements[0]) {
              (tabElements[0] as HTMLElement).focus();
            }
          }, 0);
          break;
        }

        case "End": {
          event.preventDefault();
          const lastTab = tabs[tabs.length - 1];
          onTabChange(lastTab.key);
          announceToScreenReader(`Switched to ${lastTab.title} tab`);

          setTimeout(() => {
            const tabElements =
              target?.parentElement?.querySelectorAll('[role="tab"]');
            if (tabElements && tabElements[tabs.length - 1]) {
              (tabElements[tabs.length - 1] as HTMLElement).focus();
            }
          }, 0);
          break;
        }

        case "Enter":
        case " ": {
          event.preventDefault();
          // Tab is already focused, just announce the selection
          const currentTab = tabs.find((tab) => tab.key === activeTab);
          if (currentTab) {
            announceToScreenReader(`${currentTab.title} tab activated`);
          }
          break;
        }
      }
    },
    [announceToScreenReader]
  );

  return {
    createTabProps,
    createTabListProps,
    createTabPanelProps,
    announceToScreenReader,
    handleKeyboardNavigation,
  };
}

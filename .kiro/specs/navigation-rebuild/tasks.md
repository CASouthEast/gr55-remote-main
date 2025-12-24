# Implementation Plan: Navigation Rebuild

## Overview

This implementation plan rebuilds the navigation system by keeping the existing bottom navigation unchanged while completely replacing both the PatchDrawer and existing PatchTopTabsNavigator with a new, clean Material Top Tab Navigator for patch editing. The approach follows a phased strategy: start with a simple POC using mock screens, verify it works, then integrate the real production screens.

The implementation will also refactor App.tsx to be more maintainable by breaking out large components into separate files, avoiding unnecessary large code blocks.

## Tasks

- [x] 1. Refactor App.tsx and create base navigation structure

  - [x] 1.1 Extract RootTabNavigator into separate component file

    - Create new file: `src/components/navigation/RootTabNavigator.tsx`
    - Move RootTabNavigator function from App.tsx to new file
    - Keep component small and focused, import only what's needed
    - Update App.tsx to import and use the extracted component
    - _Requirements: 1.1, 1.5_

  - [x] 1.2 Create mock patch screen components for POC testing

    - Create new file: `src/components/navigation/MockPatchScreens.tsx`
    - Create simple mock components: MockPatchMainScreen, MockPatchToneScreen, MockPatchEffectsScreen, MockPatchPedalGKScreen, MockPatchAssignsScreen, MockPatchOtherScreen
    - Each mock screen should display just the screen name and a simple "This is [Screen Name]" message
    - Keep components minimal and focused
    - _Requirements: 1.1, 3.1, 3.2_

  - [x] 1.3 Create new PatchSectionWithTopNavigation component
    - Create new file: `src/components/navigation/PatchSectionWithTopNavigation.tsx`
    - Implement Material Top Tab Navigator exclusively for patch editing
    - Use the mock screens initially for testing
    - Keep component focused and avoid large code blocks
    - Configure proper TypeScript interfaces for PatchTabParamList
    - _Requirements: 3.1, 3.2, 3.5_

- [x] 2. Implement POC in App.tsx with minimal changes

  - [x] 2.1 Update RootTabNavigator to use new patch navigation

    - Modify the extracted RootTabNavigator component
    - Replace both PatchDrawer and existing PatchTopTabsNavigator with new PatchSectionWithTopNavigation
    - Keep the component small and focused
    - Maintain all existing bottom navigation functionality unchanged
    - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3_

  - [x] 2.2 Clean up App.tsx navigation imports and logic
    - Remove PatchDrawer, PatchTopTabs, and related platform-specific imports
    - Remove PatchDrawerNavigator and PatchTopTabsNavigator functions
    - Remove platform-specific conditional logic for patch navigation
    - Keep App.tsx focused on providers and main structure only
    - _Requirements: 1.3, 6.2, 6.3_

- [x] 3. Major checkpoint - Verify POC works correctly

  - [x] 3.1 Test basic navigation functionality

    - Verify bottom navigation (Patch, Library, Hardware, Setup) works unchanged
    - Verify top navigation appears only in Patch section
    - Verify all mock patch screens are accessible via top tabs
    - Test navigation between tabs works correctly
    - _Requirements: 2.4, 2.5, 3.3, 3.4_

  - [x] 3.2 Test web browser compatibility
    - Test in Chrome, Firefox, Safari, and Edge
    - Verify tab labels are visible and clickable
    - Test responsive behavior at different screen sizes
    - Ensure no console errors appear
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 4. Checkpoint - Ensure POC is stable before proceeding

  - Ensure all tests pass and navigation works correctly with mock screens
  - Ask the user if questions arise before proceeding to production screen integration

- [x] 5. Integrate production patch screens

  - [x] 5.1 Replace mock screens with actual production screens

    - Replace MockPatchMainScreen with PatchMainScreen
    - Replace MockPatchToneScreen with PatchToneScreen
    - Replace MockPatchEffectsScreen with PatchEffectsScreen
    - Replace MockPatchPedalGKScreen with PatchMasterPedalGkCtlScreen
    - Replace MockPatchAssignsScreen with PatchAssignsScreen
    - Replace MockPatchOtherScreen with PatchMasterOtherScreen
    - _Requirements: 3.2, 3.5_

  - [x] 5.2 Update navigation type definitions

    - Update PatchTabParamList to match existing navigation types
    - Ensure compatibility with existing screen prop types
    - Maintain TypeScript type safety throughout
    - _Requirements: 1.4, 4.1_

  - [x] 5.3 Fix submenu navigation visibility issues
    - Identify screens with Material Top Tab Navigator submenus (PatchToneScreen, PatchEffectsScreen, PatchAssignsScreen, PatchMasterPedalGkCtlScreen)
    - Apply web-specific styling fixes to submenu tab bars for better visibility
    - Ensure consistent styling between main navigation and submenu navigation
    - Test submenu navigation in web browsers for proper text visibility
    - Update useTopTabNavigatorDefaults hook if needed for better web compatibility
    - _Requirements: 5.3, 5.4, 6.4_

- [ ] 6. Clean up legacy navigation code and refactor remaining components

  - [ ] 6.1 Remove all legacy patch navigation components

    - Remove PatchDrawerNavigator and PatchDrawerContent functions from App.tsx
    - Remove PatchStackNavigator if no longer needed (evaluate modal screens)
    - Remove drawer-related imports and conditional logic completely
    - Clean up any remaining unused navigation components
    - _Requirements: 1.3, 6.2, 6.3_

  - [ ] 6.2 Extract remaining large components from App.tsx if needed
    - Evaluate if SetupStackNavigator should be extracted to separate file
    - Keep App.tsx focused on main structure and providers only
    - Avoid large code blocks in any single file
    - Maintain clean separation of concerns
    - _Requirements: 1.5, 6.1_

- [ ] 7. Add web-specific styling enhancements

  - [ ] 7.1 Enhance tab styling for better web visibility

    - Add explicit colors for tab labels using theme colors
    - Include web-specific CSS properties (userSelect, cursor)
    - Add hover states and focus indicators
    - Ensure proper contrast ratios for accessibility
    - _Requirements: 5.3, 5.4, 6.4_

  - [ ] 7.2 Add accessibility features
    - Include ARIA labels and accessibility attributes
    - Ensure keyboard navigation works correctly
    - Add screen reader compatibility
    - Test with accessibility tools
    - _Requirements: 4.3, 4.4_

- [ ] 8. Final testing and validation

  - [ ] 8.1 Comprehensive navigation testing

    - Test complete navigation flow with production screens
    - Verify all patch editing functionality works correctly
    - Test theme switching maintains visibility
    - Validate responsive behavior across screen sizes
    - _Requirements: 5.1, 5.2, 5.4, 6.4_

  - [ ] 8.2 Cross-browser compatibility validation
    - Test in all major browsers (Chrome, Firefox, Safari, Edge)
    - Verify consistent styling and behavior
    - Test browser back/forward button integration
    - Ensure no console errors or warnings
    - _Requirements: 5.1, 5.2, 5.5_

- [ ] 9. Final checkpoint - Complete testing and user validation
  - Ensure all functionality works correctly with production screens
  - Verify navigation is stable and user-friendly
  - Ask the user if questions arise

## Notes

- **App Running Command**: Use `npx expo start --web` to run the application in web mode for testing
- **Phased Approach**: Start with mock screens for POC, then integrate production screens
- **Complete Replacement**: Remove both PatchDrawer AND existing PatchTopTabsNavigator
- **App.tsx Refactoring**: Break out large components to separate files, keep App.tsx slim
- **Avoid Large Code Blocks**: Keep components small, focused, and maintainable
- **Minimal Changes**: Keep existing bottom navigation completely unchanged
- **Web-First**: Focus on web browser compatibility and visibility
- **TypeScript Safety**: Maintain strict typing throughout implementation
- **Major Checkpoints**: Verify POC works before touching production screens
- Each task references specific requirements for traceability

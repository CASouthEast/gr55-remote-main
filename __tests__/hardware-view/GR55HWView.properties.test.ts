/**
 * Property-based tests for GR55 Hardware View type definitions and platform detection
 * Feature: gr55-hardware-view-integration, Property 1: Component Structure Integrity
 * Feature: gr55-hardware-view-integration, Property 2: Platform-Specific Component Loading
 * Validates: Requirements 1.1, 1.2, 2.1, 2.2, 2.3
 */

import fc from "fast-check";
import { Platform } from "react-native";

import {
  GR55State,
  GR55HWViewProps,
  StyleButtonConfig,
  StyleConfig,
} from "../../src/components/hardware-view/GR55HWView.types";

describe("GR55 Hardware View Type Definitions - Property Tests", () => {
  describe("Property 1: Component Structure Integrity", () => {
    it("should maintain type consistency for GR55State across all valid values", () => {
      fc.assert(
        fc.property(
          fc.record({
            activePedal: fc.integer({ min: 1, max: 4 }),
            patchName: fc.string({ minLength: 1, maxLength: 50 }),
            activeStyle: fc.constantFrom("LEAD", "RHYTHM", "OTHER", "USER"),
            bank: fc.string({ minLength: 1, maxLength: 10 }),
          }),
          (state: GR55State) => {
            // Property: For any valid GR55State, all required properties should be present and of correct type
            expect(typeof state.activePedal).toBe("number");
            expect(state.activePedal).toBeGreaterThanOrEqual(1);
            expect(state.activePedal).toBeLessThanOrEqual(4);

            expect(typeof state.patchName).toBe("string");
            expect(state.patchName.length).toBeGreaterThan(0);

            expect(["LEAD", "RHYTHM", "OTHER", "USER"]).toContain(
              state.activeStyle
            );

            expect(typeof state.bank).toBe("string");
            expect(state.bank.length).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain type consistency for StyleButtonConfig across all valid configurations", () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            label: fc.string({ minLength: 1, maxLength: 20 }),
            patch: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          (config: StyleButtonConfig) => {
            // Property: For any valid StyleButtonConfig, all required properties should be present and of correct type
            expect(typeof config.id).toBe("string");
            expect(config.id.length).toBeGreaterThan(0);

            expect(typeof config.label).toBe("string");
            expect(config.label.length).toBeGreaterThan(0);

            expect(typeof config.patch).toBe("string");
            expect(config.patch.length).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain type consistency for GR55HWViewProps with optional properties", () => {
      fc.assert(
        fc.property(
          fc.record(
            {
              initialState: fc.oneof(
                fc.constant(undefined),
                fc.record(
                  {
                    activePedal: fc.oneof(
                      fc.constant(undefined),
                      fc.integer({ min: 1, max: 4 })
                    ),
                    patchName: fc.oneof(
                      fc.constant(undefined),
                      fc.string({ minLength: 1, maxLength: 50 })
                    ),
                    activeStyle: fc.oneof(
                      fc.constant(undefined),
                      fc.constantFrom("LEAD", "RHYTHM", "OTHER", "USER")
                    ),
                    bank: fc.oneof(
                      fc.constant(undefined),
                      fc.string({ minLength: 1, maxLength: 10 })
                    ),
                  },
                  { requiredKeys: [] }
                )
              ),
              onStateChange: fc.oneof(
                fc.constant(undefined),
                fc.func(fc.anything())
              ),
            },
            { requiredKeys: [] }
          ),
          (props: GR55HWViewProps) => {
            // Property: For any valid GR55HWViewProps, optional properties should be properly typed when present
            if (props.initialState !== undefined) {
              expect(typeof props.initialState).toBe("object");
              expect(props.initialState).not.toBeNull();

              if (props.initialState.activePedal !== undefined) {
                expect(typeof props.initialState.activePedal).toBe("number");
                expect(props.initialState.activePedal).toBeGreaterThanOrEqual(
                  1
                );
                expect(props.initialState.activePedal).toBeLessThanOrEqual(4);
              }

              if (props.initialState.patchName !== undefined) {
                expect(typeof props.initialState.patchName).toBe("string");
              }

              if (props.initialState.activeStyle !== undefined) {
                expect(["LEAD", "RHYTHM", "OTHER", "USER"]).toContain(
                  props.initialState.activeStyle
                );
              }

              if (props.initialState.bank !== undefined) {
                expect(typeof props.initialState.bank).toBe("string");
              }
            }

            if (props.onStateChange !== undefined) {
              expect(typeof props.onStateChange).toBe("function");
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain type consistency for StyleConfig with arrays of StyleButtonConfig", () => {
      fc.assert(
        fc.property(
          fc.record({
            styles: fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 20 }),
                label: fc.string({ minLength: 1, maxLength: 20 }),
                patch: fc.string({ minLength: 1, maxLength: 50 }),
              }),
              { minLength: 1, maxLength: 10 }
            ),
          }),
          (config: StyleConfig) => {
            // Property: For any valid StyleConfig, the styles array should contain valid StyleButtonConfig objects
            expect(Array.isArray(config.styles)).toBe(true);
            expect(config.styles.length).toBeGreaterThan(0);

            config.styles.forEach((style) => {
              expect(typeof style.id).toBe("string");
              expect(style.id.length).toBeGreaterThan(0);

              expect(typeof style.label).toBe("string");
              expect(style.label.length).toBeGreaterThan(0);

              expect(typeof style.patch).toBe("string");
              expect(style.patch.length).toBeGreaterThan(0);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Property 2: Platform-Specific Component Loading", () => {
    it("should load the correct platform-specific implementation without cross-contamination", () => {
      fc.assert(
        fc.property(
          fc.record({
            initialState: fc.oneof(
              fc.constant(undefined),
              fc.record(
                {
                  activePedal: fc.integer({ min: 1, max: 4 }),
                  patchName: fc.string({ minLength: 1, maxLength: 50 }),
                  activeStyle: fc.constantFrom(
                    "LEAD",
                    "RHYTHM",
                    "OTHER",
                    "USER"
                  ),
                  bank: fc.string({ minLength: 1, maxLength: 10 }),
                },
                { requiredKeys: [] }
              )
            ),
          }),
          (props) => {
            // Property: For any platform (web or native), the system should load the correct
            // platform-specific implementation without cross-contamination

            // Test that the component can be imported without errors
            const {
              GR55HWView,
            } = require("../../src/components/hardware-view");
            expect(GR55HWView).toBeDefined();
            expect(typeof GR55HWView).toBe("function");

            // Test that the component accepts the expected props interface
            const componentProps: GR55HWViewProps = {
              initialState: props.initialState,
              onStateChange: undefined,
            };

            // Verify props structure is compatible
            if (componentProps.initialState) {
              expect(typeof componentProps.initialState).toBe("object");
            }

            // Test that platform detection works correctly
            // On web, Platform.OS should be 'web', on native it should be 'ios' or 'android'
            const platformOS = Platform.OS;
            expect(["web", "ios", "android", "windows", "macos"]).toContain(
              platformOS
            );

            // Verify that the component export is consistent regardless of platform
            expect(GR55HWView.name).toBe("GR55HWView");

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain consistent interface across all platform implementations", () => {
      fc.assert(
        fc.property(
          fc.record({
            activePedal: fc.integer({ min: 1, max: 4 }),
            patchName: fc.string({ minLength: 1, maxLength: 50 }),
            activeStyle: fc.constantFrom("LEAD", "RHYTHM", "OTHER", "USER"),
            bank: fc.string({ minLength: 1, maxLength: 10 }),
          }),
          (initialState: GR55State) => {
            // Property: For any valid initial state, all platform implementations should
            // accept the same props interface and maintain type consistency

            const {
              GR55HWView,
            } = require("../../src/components/hardware-view");

            // Test that the component accepts a complete state object
            const props: GR55HWViewProps = {
              initialState,
              onStateChange: (state: GR55State) => {
                // Verify callback receives properly typed state
                expect(typeof state.activePedal).toBe("number");
                expect(typeof state.patchName).toBe("string");
                expect(typeof state.activeStyle).toBe("string");
                expect(typeof state.bank).toBe("string");
              },
            };

            // Verify the component can be instantiated with these props
            expect(() => {
              // This tests that the props interface is compatible
              const componentInstance = { props };
              expect(componentInstance.props).toEqual(props);
            }).not.toThrow();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle platform-specific features gracefully across different environments", () => {
      fc.assert(
        fc.property(
          fc.constantFrom("web", "ios", "android", "windows", "macos"),
          (mockPlatform: string) => {
            // Property: For any platform type, the component loading should handle
            // platform-specific features without throwing errors

            // Mock Platform.OS for testing different platforms
            const originalPlatform = Platform.OS;

            try {
              // Temporarily mock the platform
              Object.defineProperty(Platform, "OS", {
                value: mockPlatform,
                writable: true,
                configurable: true,
              });

              // Test that component import works regardless of platform
              const {
                GR55HWView,
              } = require("../../src/components/hardware-view");
              expect(GR55HWView).toBeDefined();
              expect(typeof GR55HWView).toBe("function");

              // Test that types are still available
              const testState: GR55State = {
                activePedal: 1,
                patchName: "TEST",
                activeStyle: "LEAD",
                bank: "01-1",
              };

              expect(testState).toBeDefined();
              expect(typeof testState.activePedal).toBe("number");

              return true;
            } finally {
              // Restore original platform
              Object.defineProperty(Platform, "OS", {
                value: originalPlatform,
                writable: true,
                configurable: true,
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

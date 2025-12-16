# SysEx Mapping Optimization

This document proposes a new architecture for managing SysEx data mappings in the GR-55 Remote application. The goal is to replace the current hardcoded system with a more flexible, data-driven approach that is easier to maintain and extend.

## 1. Analysis of the Current Architecture

The current architecture for handling SysEx data is centered around the `RolandGR55AddressMap.ts` file. This file contains a series of large, hand-written `StructDefinition` objects that map every parameter of the GR-55 to a specific address in the device's memory.

While this approach works, it has several significant drawbacks:

*   **High Maintenance Overhead:** The address map is massive and highly repetitive. Adding, removing, or changing a parameter requires manually editing this large file, which is error-prone and time-consuming.
*   **Boilerplate UI Code:** The UI screens are tightly coupled to the address map. Each screen consists of a list of `RemoteField...` components, each one manually bound to a specific field in the address map. This leads to a large amount of boilerplate code. For example, the `PatchEffectsAmpScreen.tsx` is almost entirely a list of these components.
*   **Hardcoded Logic:** Relationships between fields are hardcoded in the UI components. For example, the `ampBright` switch in the `PatchEffectsAmpScreen.tsx` is only shown when the `ampType` has a specific value. This logic is duplicated wherever these fields are used.
*   **Lack of Abstraction:** The current system lacks abstraction. The concepts of a "field", its data type, its UI representation, and its relationship to other fields are all intertwined in the address map and the UI components.

## 2. Proposed Architecture: A Data-Driven Approach

To address these issues, we propose a new data-driven architecture based on a set of JSON configuration files. These files will define the structure of the SysEx data, the UI representation of each parameter, and the relationships between them.

The new architecture will consist of the following components:

1.  **JSON Configuration Files:** A set of JSON files that define the SysEx data structure.
2.  **Code Generation Script:** A script that reads the JSON files and generates the necessary TypeScript code, including the address map and data type definitions.
3.  **Dynamic UI Rendering:** A generic component that dynamically renders UI controls based on the JSON configuration.

This approach will decouple the data definition from the application logic, making the codebase more modular, maintainable, and scalable.

## 3. JSON Configuration Files

The core of the new architecture is a set of JSON files that define the SysEx parameters. Instead of one monolithic file, we will split the configuration into logical groups (e.g., `common.json`, `amp.json`, `p-tone.json`, `m-tone.json`).

Each JSON file will contain an array of field definitions. Here is an example of what the configuration for a few fields in the amplifier section might look like in a file named `amp.json`:

```json
[
  {
    "name": "ampSwitch",
    "label": "Amp Switch",
    "address": "0x6000",
    "type": "boolean",
    "ui": {
      "control": "switch"
    }
  },
  {
    "name": "ampType",
    "label": "Amp Type",
    "address": "0x6001",
    "type": "enum",
    "encoding": "ubyte",
    "ui": {
      "control": "picker",
      "options": [
        "JC-120",
        "CLEAN TWIN",
        "PRO CRUNCH",
        "TWEED",
        "BOSS CRUNCH",
        "BLUES",
        "STACK CRUNCH",
        "BG LEAD",
        "BG DRIVE",
        "BG RHYTHM",
        "MS1959 I",
        "MS1959 I+II",
        "R-FIER VINTAGE",
        "R-FIER MODERN",
        "T-AMP LEAD",
        "SLDN",
        "5150 DRIVE",
        "CUSTOM"
      ]
    }
  },
  {
    "name": "ampGain",
    "label": "Gain",
    "address": "0x6002",
    "type": "integer",
    "encoding": "ubyte",
    "ui": {
      "control": "slider",
      "min": 0,
      "max": 100
    }
  },
  {
    "name": "ampBright",
    "label": "Bright",
    "address": "0x6012",
    "type": "boolean",
    "ui": {
      "control": "switch",
      "showWhen": "ampType in ['JC-120', 'CLEAN TWIN', 'PRO CRUNCH', 'TWEED', 'BOSS CRUNCH', 'BLUES', 'STACK CRUNCH', 'BG LEAD', 'BG DRIVE', 'BG RHYTHM']"
    }
  }
]
```

### JSON Schema Definition

*   **`name`**: A unique identifier for the field, used as the key in the application's state.
*   **`label`**: The human-readable label to be displayed in the UI.
*   **`address`**: The hexadecimal SysEx address for the parameter.
*   **`type`**: The data type. Can be `"boolean"`, `"integer"`, `"enum"`, or `"string"`.
*   **`encoding`**: (Optional) Specifies how the data is encoded. Examples: `"ubyte"` (unsigned byte), `"sbyte"` (signed byte with offset), `"split12"` (12-bit value split across bytes), `"ascii"`. The code generator will use this to create the correct `FieldType` instance.
*   **`size`**: (Optional) The size of the field in bytes (e.g., for strings).
*   **`ui`**: An object that describes the UI representation of the field.
    *   **`control`**: The type of UI control, e.g., `"switch"`, `"picker"`, `"slider"`, `"textInput"`.
    *   **`options`**: (For `picker`) An array of strings for the available values.
    *   **`min`**, **`max`**: (For `slider`) The minimum and maximum values.
    *   **`showWhen`**: (Optional) A string containing a logical expression. This expression will be evaluated at runtime to determine if the UI control should be visible. This replaces the hardcoded conditional logic in the current UI components.
*   **`items`**: (Optional) For struct-like containers, this would contain a nested array of field definitions.
*   **`count`**: (Optional) For repeated blocks (like assigns), this specifies how many times the `items` structure is repeated.

## 4. Code Generation

A code generation script (e.g., a Node.js script) will be created. This script will read the JSON configuration files and automatically generate `RolandGR55AddressMap.ts`.

The script will perform the following actions:

1.  **Parse JSON files:** Read all `*.json` files from the configuration directory.
2.  **Generate `StructDefinition`s:** For each group of fields in the JSON, it will generate a `StructDefinition` object, creating `FieldDefinition` instances for each field with the correct address, description, and `FieldType`.
3.  **Create `FieldType` Instances:** It will instantiate the appropriate `FieldType` classes (e.g., `BooleanField`, `UByteField`, `enumField`) based on the `type` and `encoding` specified in the JSON.
4.  **Generate TypeScript Types:** The script can also generate TypeScript interfaces corresponding to the data structures defined in the JSON. This will provide strong typing for the patch data throughout the application.

By automating this process, we eliminate the need for manual updates to the address map, reducing the risk of errors and significantly speeding up development.

## 5. Dynamic UI Rendering

Instead of having a separate, statically defined screen for each section of the effects, we will create a generic `DynamicScreen` or `DynamicSection` component.

This component will:

1.  **Accept a configuration:** Take an array of field definitions (from our JSON) as a prop.
2.  **Iterate over the fields:** Loop through the field definitions.
3.  **Render controls dynamically:** For each field, it will render the appropriate UI control based on the `ui.control` property. A map or a `switch` statement will be used to resolve the control type (e.g., "slider") to a component (e.g., `<RemoteFieldSlider />`).
4.  **Handle conditional visibility:** Before rendering a control, it will evaluate the `ui.showWhen` expression, if present, against the current state of the patch.

This approach will drastically reduce the amount of UI code. The `PatchEffectsAmpScreen.tsx`, for example, would be reduced to a single `<DynamicSection />` component that is passed the `amp.json` configuration.

## 6. Refactoring Plan

The transition to the new architecture can be done incrementally:

1.  **Create JSON Definitions:** Create the initial set of JSON configuration files by manually converting the data from the existing `RolandGR55AddressMap.ts`. This is a one-time effort.
2.  **Develop Code Generation Script:** Write the Node.js script that consumes the JSON files and generates a new `RolandGR55AddressMap_generated.ts` file.
3.  **Integrate Generated Map:** Update the application to import and use the new generated address map instead of the old one. At this stage, the application should function as before, but the address map is now generated automatically.
4.  **Develop Dynamic UI Components:** Create the `DynamicSection` component that can render UI controls from the JSON configuration.
5.  **Refactor UI Screens:** One by one, refactor the existing UI screens (like `PatchEffectsAmpScreen.tsx`, `PatchToneModelingScreen.tsx`, etc.) to use the `DynamicSection` component, removing the hardcoded `RemoteField...` components.

## 7. Benefits

This new architecture offers several key advantages:

*   **Maintainability:** Adding or modifying parameters becomes as simple as editing a JSON file. The risk of introducing errors is significantly reduced.
*   **Scalability:** The system can easily be extended to support other SysEx-controllable devices by creating new sets of JSON configuration files.
*   **Reduced Boilerplate:** The amount of repetitive UI code will be drastically reduced, leading to a smaller, cleaner, and more manageable codebase.
*   **Single Source of Truth:** The JSON files become the single source of truth for the SysEx data model, ensuring consistency between the data definition, the application logic, and the UI.
*   **Rapid Development:** New UI screens for different sections of the device can be created very quickly, often just by creating a new JSON file.




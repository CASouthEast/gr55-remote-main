
# Project Structure and Data Flow

This document provides an in-depth analysis of the project's structure, with a focus on how MIDI SysEx data is interpreted and displayed as UI elements.

## Core Concepts

The application is built around a few core concepts:

- **Address Map:** A comprehensive mapping of the Roland GR-55's memory. This is the "dictionary" that translates raw MIDI SysEx data into meaningful parameters.
- **SysEx Protocol:** A low-level implementation of the Roland SysEx protocol, including message construction, parsing, and checksum validation.
- **Data Transfer:** A centralized mechanism for sending and receiving SysEx messages, with a queuing system to manage the flow of data.
- **State Management:** A system of React hooks that manage the state of the GR-55's parameters, providing a bridge between the data transfer layer and the UI.
- **UI Components:** A set of reusable UI components (sliders, pickers, etc.) that are connected to the state management system.

## Key Files and Modules

### 1. MIDI and SysEx Communication

- **`MidiIo.tsx`**: This file is responsible for initializing and managing MIDI I/O. It uses the `@motiz88/react-native-midi` library to request MIDI access and provides a `MidiIoContext` to make the MIDI input and output ports available to the rest of the application.

- **`RolandSysExProtocol.ts`**: This file contains the low-level implementation of the Roland SysEx protocol. It defines constants for different message types, functions for calculating checksums, and functions for constructing and parsing SysEx messages (`makeDataSetMessage`, `makeDataRequestMessage`, `parseDataResponseMessage`).

- **`RolandDataTransfer.tsx`**: This is the heart of the data transfer mechanism. It provides a `RolandDataTransferContext` that exposes functions for requesting data (`requestData`) and setting values (`setField`). It uses a `MultiQueueScheduler` to prioritize and schedule MIDI messages, and it listens for incoming MIDI messages to resolve pending data requests.

### 2. Data Mapping and State Management

- **`RolandGR55AddressMap.ts`**: This massive file defines the entire memory map of the GR-55. It uses `FieldDefinition` and `StructDefinition` to create a hierarchical representation of the device's parameters. Each field is defined with its address, name, data type, and other properties.

- **`useRolandRemotePageState.tsx`**: This file contains the `useRolandRemotePageState` hook, which is responsible for fetching a "page" of data from the GR-55. A page is a `StructDefinition` from the address map. The hook uses the `requestData` function from the `RolandDataTransferContext` to fetch the data and then caches it locally. It also provides a subscription mechanism (`subscribeToField`) that allows UI components to be notified of changes to specific fields.

- **`useRolandRemotePatchState.tsx`**: This file contains the `useRolandRemotePatchState` hook, which is the main entry point for UI components to interact with the patch data. It uses `useRolandRemotePageState` to fetch and manage the state of the temporary patch area on the GR-55. It also provides a `setRemoteField` function that updates the local state and sends a SysEx message to the device.

### 3. UI Components

- **`useRemoteField.tsx`**: This hook acts as the glue between the state management system and the UI components. It takes a field definition from the address map as input and returns the current value of the field, a function to update the value, and other properties.

- **`RemoteField*.tsx` (e.g., `RemoteFieldSlider.tsx`, `RemoteFieldPicker.tsx`)**: These are the actual UI components that the user interacts with. They use the `useRemoteField` hook to bind to a specific parameter and render the appropriate UI element.

## Data Flow Summary

### Reading Data from the GR-55

1.  A UI component uses the `useRemoteField` hook to subscribe to a specific parameter.
2.  The `useRemoteField` hook uses `useRolandRemotePatchState` and `useRolandRemotePageState` to fetch the relevant data from the GR-55.
3.  `useRolandRemotePageState` calls the `requestData` function from the `RolandDataTransferContext`.
4.  `RolandDataTransfer` constructs a `Data Request` SysEx message using `makeDataRequestMessage` and sends it to the GR-55 via the MIDI output port.
5.  The GR-55 responds with a `Data Set` message.
6.  `RolandDataTransfer` receives the message, parses it using `parseDataResponseMessage`, and resolves the pending data request.
7.  `useRolandRemotePageState` updates its local cache with the new data.
8.  The `subscribeToField` mechanism notifies the `useRemoteField` hook of the change.
9.  The UI component re-renders with the new value.

### Writing Data to the GR-55

1.  The user interacts with a UI component (e.g., moves a slider).
2.  The component's `onChange` handler calls the `setRemoteField` function provided by the `useRemoteField` hook.
3.  `useRemoteField` calls the `setRemoteField` function from `useRolandRemotePatchState`.
4.  `useRolandRemotePatchState` calls the `setRemoteField` function from `useRolandRemotePageState`.
5.  `useRolandRemotePageState` updates its local cache to provide immediate feedback to the user, and then calls the `setField` function from the `RolandDataTransferContext`.
6.  `RolandDataTransfer` constructs a `Data Set` SysEx message using `makeDataSetMessage` and sends it to the GR-55.

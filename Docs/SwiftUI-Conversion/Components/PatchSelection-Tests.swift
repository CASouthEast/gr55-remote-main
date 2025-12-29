import XCTest
import SwiftUI
@testable import GR55SwiftUIConversion

// MARK: - Patch Selection Tests
/// Unit tests for patch selection functionality
/// Validates core logic and data handling
@MainActor
final class PatchSelectionTests: XCTestCase {
    
    var stateManager: GR55StateManager!
    
    override func setUp() async throws {
        try await super.setUp()
        stateManager = GR55StateManager()
    }
    
    override func tearDown() async throws {
        stateManager = nil
        try await super.tearDown()
    }
    
    // MARK: - Patch Data Model Tests
    
    func testPatchInfoCreation() {
        let patch = PatchInfo(
            name: "Test Patch",
            description: "A test patch",
            style: .lead,
            category: .guitar,
            bank: "01-1",
            tags: ["test", "guitar", "lead"]
        )
        
        XCTAssertEqual(patch.name, "Test Patch")
        XCTAssertEqual(patch.description, "A test patch")
        XCTAssertEqual(patch.style, .lead)
        XCTAssertEqual(patch.category, .guitar)
        XCTAssertEqual(patch.bank, "01-1")
        XCTAssertEqual(patch.tags, ["test", "guitar", "lead"])
    }
    
    func testPatchInfoEquality() {
        let id = UUID()
        let patch1 = PatchInfo(id: id, name: "Test", description: "Test", style: .lead, category: .guitar, bank: "01-1")
        let patch2 = PatchInfo(id: id, name: "Different", description: "Different", style: .rhythm, category: .bass, bank: "02-2")
        
        XCTAssertEqual(patch1, patch2) // Should be equal because same ID
    }
    
    func testPatchInfoHashable() {
        let patch1 = PatchInfo(name: "Test 1", description: "Test", style: .lead, category: .guitar, bank: "01-1")
        let patch2 = PatchInfo(name: "Test 2", description: "Test", style: .lead, category: .guitar, bank: "01-2")
        
        let patchSet: Set<PatchInfo> = [patch1, patch2]
        XCTAssertEqual(patchSet.count, 2)
    }
    
    // MARK: - Patch Category Tests
    
    func testPatchCategoryDisplayNames() {
        XCTAssertEqual(PatchCategory.all.displayName, "ALL")
        XCTAssertEqual(PatchCategory.guitar.displayName, "GUITAR")
        XCTAssertEqual(PatchCategory.bass.displayName, "BASS")
        XCTAssertEqual(PatchCategory.synth.displayName, "SYNTH")
        XCTAssertEqual(PatchCategory.organ.displayName, "ORGAN")
        XCTAssertEqual(PatchCategory.effects.displayName, "EFFECTS")
        XCTAssertEqual(PatchCategory.user.displayName, "USER")
    }
    
    func testPatchCategoryIcons() {
        XCTAssertEqual(PatchCategory.all.icon, "music.note.list")
        XCTAssertEqual(PatchCategory.guitar.icon, "guitars")
        XCTAssertEqual(PatchCategory.bass.icon, "guitars.fill")
        XCTAssertEqual(PatchCategory.synth.icon, "waveform")
        XCTAssertEqual(PatchCategory.organ.icon, "pianokeys")
        XCTAssertEqual(PatchCategory.effects.icon, "waveform.path.ecg")
        XCTAssertEqual(PatchCategory.user.icon, "person.crop.circle")
    }
    
    // MARK: - State Manager Patch Selection Tests
    
    func testLoadAvailablePatches() async {
        let patches = await stateManager.loadAvailablePatches()
        
        XCTAssertFalse(patches.isEmpty)
        XCTAssertTrue(patches.count > 0)
        
        // Verify we have patches for all styles
        let styles = Set(patches.map { $0.style })
        XCTAssertEqual(styles.count, SoundStyle.allCases.count)
        
        // Verify we have patches for all categories (except .all)
        let categories = Set(patches.map { $0.category })
        XCTAssertTrue(categories.contains(.guitar))
        XCTAssertTrue(categories.contains(.bass))
        XCTAssertTrue(categories.contains(.synth))
    }
    
    func testSearchPatchesWithQuery() async {
        let allPatches = await stateManager.loadAvailablePatches()
        let searchResults = await stateManager.searchPatches(query: "LEAD", category: nil, style: nil)
        
        XCTAssertFalse(searchResults.isEmpty)
        XCTAssertTrue(searchResults.count <= allPatches.count)
        
        // All results should contain "LEAD" in name, description, or tags
        for patch in searchResults {
            let containsLead = patch.name.localizedCaseInsensitiveContains("LEAD") ||
                              patch.description.localizedCaseInsensitiveContains("LEAD") ||
                              patch.tags.contains { $0.localizedCaseInsensitiveContains("LEAD") }
            XCTAssertTrue(containsLead, "Patch '\(patch.name)' should contain 'LEAD'")
        }
    }
    
    func testSearchPatchesWithCategory() async {
        let searchResults = await stateManager.searchPatches(query: "", category: .guitar, style: nil)
        
        XCTAssertFalse(searchResults.isEmpty)
        
        // All results should be guitar category
        for patch in searchResults {
            XCTAssertEqual(patch.category, .guitar, "All results should be guitar category")
        }
    }
    
    func testSearchPatchesWithStyle() async {
        let searchResults = await stateManager.searchPatches(query: "", category: nil, style: .lead)
        
        XCTAssertFalse(searchResults.isEmpty)
        
        // All results should be lead style
        for patch in searchResults {
            XCTAssertEqual(patch.style, .lead, "All results should be lead style")
        }
    }
    
    func testSearchPatchesWithMultipleFilters() async {
        let searchResults = await stateManager.searchPatches(query: "CLEAN", category: .guitar, style: .lead)
        
        // Results should match all criteria
        for patch in searchResults {
            XCTAssertEqual(patch.category, .guitar)
            XCTAssertEqual(patch.style, .lead)
            
            let containsClean = patch.name.localizedCaseInsensitiveContains("CLEAN") ||
                               patch.description.localizedCaseInsensitiveContains("CLEAN") ||
                               patch.tags.contains { $0.localizedCaseInsensitiveContains("CLEAN") }
            XCTAssertTrue(containsClean)
        }
    }
    
    func testSelectPatch() async {
        let testPatch = PatchInfo(
            name: "Test Lead Guitar",
            description: "A test lead guitar patch",
            style: .lead,
            category: .guitar,
            bank: "05-2",
            tags: ["test", "lead", "guitar"]
        )
        
        let initialPatchName = stateManager.state.patchName
        let initialBank = stateManager.state.bank
        let initialStyle = stateManager.state.activeStyle
        
        await stateManager.selectPatch(testPatch)
        
        XCTAssertEqual(stateManager.state.patchName, "Test Lead Guitar")
        XCTAssertEqual(stateManager.state.activeStyle, .lead)
        XCTAssertEqual(stateManager.state.bank, "05-2")
        XCTAssertEqual(stateManager.state.activePedal, 2) // Extracted from bank "05-2"
        
        // Verify state actually changed
        XCTAssertNotEqual(stateManager.state.patchName, initialPatchName)
    }
    
    // MARK: - Patch Matching Tests
    
    func testPatchMatches() {
        let patch = PatchInfo(
            name: "Lead Guitar Clean",
            description: "A clean lead guitar sound",
            style: .lead,
            category: .guitar,
            bank: "01-1",
            tags: ["clean", "lead", "guitar", "bright"]
        )
        
        XCTAssertTrue(patch.matches(query: ""))
        XCTAssertTrue(patch.matches(query: "Lead"))
        XCTAssertTrue(patch.matches(query: "clean"))
        XCTAssertTrue(patch.matches(query: "GUITAR"))
        XCTAssertTrue(patch.matches(query: "bright"))
        XCTAssertTrue(patch.matches(query: "sound"))
        
        XCTAssertFalse(patch.matches(query: "bass"))
        XCTAssertFalse(patch.matches(query: "distortion"))
        XCTAssertFalse(patch.matches(query: "xyz"))
    }
    
    // MARK: - Sample Data Tests
    
    func testSamplePatchCreation() {
        let sample = PatchInfo.sample()
        
        XCTAssertEqual(sample.name, "Sample Patch")
        XCTAssertEqual(sample.style, .lead)
        XCTAssertEqual(sample.category, .guitar)
        XCTAssertEqual(sample.bank, "01-1")
        XCTAssertTrue(sample.tags.contains("sample"))
    }
    
    func testSamplePatchCustomization() {
        let sample = PatchInfo.sample(name: "Custom Test", style: .rhythm, category: .bass)
        
        XCTAssertEqual(sample.name, "Custom Test")
        XCTAssertEqual(sample.style, .rhythm)
        XCTAssertEqual(sample.category, .bass)
    }
    
    // MARK: - Performance Tests
    
    func testPatchLoadingPerformance() async {
        measure {
            Task {
                let patches = await stateManager.loadAvailablePatches()
                XCTAssertFalse(patches.isEmpty)
            }
        }
    }
    
    func testSearchPerformance() async {
        let allPatches = await stateManager.loadAvailablePatches()
        
        measure {
            Task {
                let results = await stateManager.searchPatches(query: "LEAD", category: .guitar, style: .lead)
                XCTAssertFalse(results.isEmpty)
            }
        }
    }
    
    // MARK: - Edge Case Tests
    
    func testEmptySearchQuery() async {
        let allPatches = await stateManager.loadAvailablePatches()
        let searchResults = await stateManager.searchPatches(query: "", category: nil, style: nil)
        
        XCTAssertEqual(searchResults.count, allPatches.count)
    }
    
    func testNonExistentSearchQuery() async {
        let searchResults = await stateManager.searchPatches(query: "NonExistentPatch12345", category: nil, style: nil)
        
        XCTAssertTrue(searchResults.isEmpty)
    }
    
    func testCaseInsensitiveSearch() async {
        let lowerResults = await stateManager.searchPatches(query: "lead", category: nil, style: nil)
        let upperResults = await stateManager.searchPatches(query: "LEAD", category: nil, style: nil)
        let mixedResults = await stateManager.searchPatches(query: "Lead", category: nil, style: nil)
        
        XCTAssertEqual(lowerResults.count, upperResults.count)
        XCTAssertEqual(upperResults.count, mixedResults.count)
    }
}

// MARK: - Mock Data for Testing
extension PatchSelectionTests {
    
    /// Creates a set of test patches for validation
    func createTestPatches() -> [PatchInfo] {
        return [
            PatchInfo(name: "Lead Clean", description: "Clean lead guitar", style: .lead, category: .guitar, bank: "01-1", tags: ["clean", "lead"]),
            PatchInfo(name: "Rhythm Crunch", description: "Crunchy rhythm guitar", style: .rhythm, category: .guitar, bank: "01-2", tags: ["crunch", "rhythm"]),
            PatchInfo(name: "Bass Finger", description: "Fingered bass sound", style: .lead, category: .bass, bank: "02-1", tags: ["finger", "bass"]),
            PatchInfo(name: "Synth Pad", description: "Warm synth pad", style: .other, category: .synth, bank: "03-1", tags: ["pad", "synth", "warm"]),
            PatchInfo(name: "User Custom", description: "Custom user patch", style: .user, category: .user, bank: "04-1", tags: ["custom", "user"])
        ]
    }
}
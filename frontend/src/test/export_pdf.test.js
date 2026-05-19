import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportCartPdf, getIsoDate } from "../utils/exportPDF";
import { FIXTURE_PRODUCTS } from "../api/fixtures";

// Mock jsPDF with constructor function
const mockSave = vi.fn();
const mockText = vi.fn();
const mockRect = vi.fn();
const mockCircle = vi.fn();
const mockSetFillColor = vi.fn();
const mockSetTextColor = vi.fn();
const mockSetFont = vi.fn();
const mockSetFontSize = vi.fn();
const mockAutoTable = vi.fn();

vi.mock("jspdf", () => {
  return {
    default: vi.fn().mockImplementation(function () {
      this.save = mockSave;
      this.text = mockText;
      this.rect = mockRect;
      this.circle = mockCircle;
      this.setFillColor = mockSetFillColor;
      this.setTextColor = mockSetTextColor;
      this.setFont = mockSetFont;
      this.setFontSize = mockSetFontSize;
      this.autoTable = mockAutoTable;
    }),
  };
});

describe("PDF Export Utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("formats date properly in YYYY-MM-DD", () => {
    const fixedDate = new Date(2026, 4, 19); // May 19, 2026
    expect(getIsoDate(fixedDate)).toBe("2026-05-19");
  });

  it("generates PDF with correct filename and table rows", () => {
    const testEntries = [
      { product: FIXTURE_PRODUCTS[0], quantity: 2 },
      { product: FIXTURE_PRODUCTS[1], quantity: 1 },
    ];
    const profile = { condition: "diabetic", household: 2, budget: 1000 };

    const filename = exportCartPdf(testEntries, 175, profile);

    const todayIso = getIsoDate(new Date());
    expect(filename).toBe(`nutrikart-list-${todayIso}.pdf`);
    expect(mockSave).toHaveBeenCalledWith(`nutrikart-list-${todayIso}.pdf`);

    // Verify autoTable call arguments
    expect(mockAutoTable).toHaveBeenCalledTimes(1);
    const tableConfig = mockAutoTable.mock.calls[0][0];
    expect(tableConfig.body.length).toBe(2);
    expect(tableConfig.body[0][0]).toBe(FIXTURE_PRODUCTS[0].name);
    expect(tableConfig.body[1][0]).toBe(FIXTURE_PRODUCTS[1].name);
  });

  it("handles empty cart without crashing", () => {
    expect(() => {
      exportCartPdf([], 0, null);
    }).not.toThrow();

    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});

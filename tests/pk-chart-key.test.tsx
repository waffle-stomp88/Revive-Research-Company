import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MiniPKChart } from "@/components/mini-pk-chart";
import { RESEARCH_STACKS_DATA } from "@/data/research-stacks";

/**
 * Rendering tests for the listing-page mini PK chart and SC/Other-route key.
 *
 * These tests mount the actual MiniPKChart component in jsdom and assert that:
 *   1. The SVG element (data-testid="mini-pk-chart-{stackId}") is rendered for
 *      pre-built stack cards that have PK data.
 *   2. The line-style key (data-testid="pk-line-style-key-{stackId}") is rendered
 *      for stacks whose compounds include at least one non-subcutaneous route.
 *
 * Regressions caught:
 *   - MiniPKChart removed from card markup (testid absent → test fails)
 *   - Non-SC PK entry deleted, making hasNonSC always false (key absent → test fails)
 *   - Component refactored with a different testid (test fails)
 */

describe("MiniPKChart — listing-page rendering", () => {
  it("renders the mini-pk-chart SVG for stacks with known PK data", () => {
    const recoveryStack = RESEARCH_STACKS_DATA.find(s => s.id === "recovery-tissue-stack");
    expect(recoveryStack).toBeDefined();

    const peptideNames = recoveryStack!.peptides.map(p => p.name);
    render(<MiniPKChart peptideNames={peptideNames} stackId={recoveryStack!.id} />);

    const chartEl = screen.getByTestId(`mini-pk-chart-${recoveryStack!.id}`);
    expect(chartEl).toBeInTheDocument();
    expect(chartEl.tagName.toLowerCase()).toBe("svg");
  });

  it("renders mini-pk-chart SVGs for all pre-built research stacks that have PK data", () => {
    for (const stack of RESEARCH_STACKS_DATA) {
      const peptideNames = stack.peptides.map(p => p.name);
      const { container, unmount } = render(
        <MiniPKChart peptideNames={peptideNames} stackId={stack.id} />
      );

      const chart = container.querySelector(`[data-testid="mini-pk-chart-${stack.id}"]`);
      expect(
        chart,
        `Expected mini-pk-chart SVG to be rendered for stack "${stack.id}" — PK data may be missing for its compounds`
      ).not.toBeNull();

      unmount();
    }
  });

  it("renders the pk-line-style-key for fat-burner (AOD-9604 SC + 5-Amino-1MQ oral — genuinely mixed routes)", () => {
    const fatBurnerStack = RESEARCH_STACKS_DATA.find(s => s.id === "fat-burner");
    expect(fatBurnerStack).toBeDefined();

    const peptideNames = fatBurnerStack!.peptides.map(p => p.name);
    render(<MiniPKChart peptideNames={peptideNames} stackId={fatBurnerStack!.id} />);

    const keyEl = screen.getByTestId(`pk-line-style-key-${fatBurnerStack!.id}`);
    expect(keyEl).toBeInTheDocument();
  });

  it("renders pk-line-style-key for cognitive-edge-stack (Selank has published IV bolus PK data → hasIVOverlay)", () => {
    // Selank has ivHalfLifeLabel set ("~2–3 min") from the Zolotarev 2006 citation audit, so
    // hasIVOverlay is true and the legend correctly shows the IV bolus overlay key even though
    // both primary administration routes are intranasal.
    const cognitiveStack = RESEARCH_STACKS_DATA.find(s => s.id === "cognitive-edge-stack");
    expect(cognitiveStack).toBeDefined();

    const peptideNames = cognitiveStack!.peptides.map(p => p.name);
    render(<MiniPKChart peptideNames={peptideNames} stackId={cognitiveStack!.id} />);

    // Selank carries an ivHalfLifeLabel (IV bolus variant ~2–3 min), so the key
    // is visible even though both compounds are intranasal as their primary route.
    const keyEl = screen.getByTestId(`pk-line-style-key-${cognitiveStack!.id}`);
    expect(keyEl).toBeInTheDocument();

    // Specifically the IV bolus overlay key should be present
    const ivKey = screen.getByTestId(`pk-iv-overlay-key-${cognitiveStack!.id}`);
    expect(ivKey).toBeInTheDocument();

    // The primary-route label must reflect the actual route ("IN") not the
    // hardcoded "SC" that existed before this fix.
    const routeLabelEl = screen.getByTestId(`pk-primary-route-label-${cognitiveStack!.id}`);
    expect(routeLabelEl).toBeInTheDocument();
    expect(routeLabelEl.textContent).toBe("IN");
    expect(routeLabelEl.textContent).not.toBe("SC");
  });

  it("shows 'SC' primary-route label for a mixed-route stack (fat-burner: AOD-9604 SC + 5-Amino-1MQ oral)", () => {
    // When the stack contains at least one SC compound, the solid-line key entry
    // correctly shows "SC" (unchanged behaviour, regression guard).
    const fatBurnerStack = RESEARCH_STACKS_DATA.find(s => s.id === "fat-burner");
    expect(fatBurnerStack).toBeDefined();

    const peptideNames = fatBurnerStack!.peptides.map(p => p.name);
    render(<MiniPKChart peptideNames={peptideNames} stackId={fatBurnerStack!.id} />);

    const routeLabelEl = screen.getByTestId(`pk-primary-route-label-${fatBurnerStack!.id}`);
    expect(routeLabelEl).toBeInTheDocument();
    expect(routeLabelEl.textContent).toBe("SC");
  });

  it("does NOT render pk-line-style-key for all-SC stacks (recovery-tissue-stack: BPC-157 + TB-500)", () => {
    const recoveryStack = RESEARCH_STACKS_DATA.find(s => s.id === "recovery-tissue-stack");
    expect(recoveryStack).toBeDefined();

    const peptideNames = recoveryStack!.peptides.map(p => p.name);
    render(<MiniPKChart peptideNames={peptideNames} stackId={recoveryStack!.id} />);

    const keyEl = screen.queryByTestId(`pk-line-style-key-${recoveryStack!.id}`);
    expect(keyEl).toBeNull();
  });

  it("at least one pre-built stack card renders a pk-line-style-key (non-SC compound must exist)", () => {
    let foundKey = false;
    for (const stack of RESEARCH_STACKS_DATA) {
      const peptideNames = stack.peptides.map(p => p.name);
      const { container, unmount } = render(
        <MiniPKChart peptideNames={peptideNames} stackId={stack.id} />
      );

      const key = container.querySelector(`[data-testid="pk-line-style-key-${stack.id}"]`);
      if (key) {
        foundKey = true;
        unmount();
        break;
      }
      unmount();
    }

    expect(
      foundKey,
      "Expected at least one pre-built stack to render the pk-line-style-key. " +
      "This fails if all non-SC PK entries were removed from pharmacokinetics.ts, " +
      "or all pre-built stacks were changed to SC-only compounds."
    ).toBe(true);
  });
});

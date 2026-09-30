import type { InitializeResponse } from '@agentclientprotocol/sdk';
import { describe, expect, it } from 'vitest';
import { hasLocalInferenceCapability, hasRecipeParameterScopesCapability } from '../capabilities';

function initializeResponseWithMeta(meta?: unknown): Pick<InitializeResponse, 'agentCapabilities'> {
  return {
    agentCapabilities: {
      _meta: meta,
    },
  } as Pick<InitializeResponse, 'agentCapabilities'>;
}

describe('ACP capabilities', () => {
  it('detects local inference support from Cryon metadata', () => {
    expect(
      hasLocalInferenceCapability(
        initializeResponseWithMeta({
          cryon: {
            localInference: {},
          },
        })
      )
    ).toBe(true);
  });

  it('detects scoped recipe-parameter support from Cryon metadata', () => {
    expect(
      hasRecipeParameterScopesCapability(
        initializeResponseWithMeta({
          cryon: {
            recipeParameterScopes: {},
          },
        })
      )
    ).toBe(true);
  });

  it('treats missing or malformed scoped recipe-parameter metadata as unsupported', () => {
    expect(hasRecipeParameterScopesCapability(initializeResponseWithMeta())).toBe(false);
    expect(hasRecipeParameterScopesCapability(initializeResponseWithMeta({}))).toBe(false);
    expect(hasRecipeParameterScopesCapability(initializeResponseWithMeta({ cryon: {} }))).toBe(
      false
    );
    expect(hasRecipeParameterScopesCapability(initializeResponseWithMeta({ cryon: true }))).toBe(
      false
    );
  });

  it('treats missing local inference metadata as unsupported', () => {
    expect(hasLocalInferenceCapability(initializeResponseWithMeta())).toBe(false);
    expect(hasLocalInferenceCapability(initializeResponseWithMeta({}))).toBe(false);
    expect(hasLocalInferenceCapability(initializeResponseWithMeta({ cryon: {} }))).toBe(false);
  });

  it('ignores malformed Cryon metadata', () => {
    expect(hasLocalInferenceCapability(initializeResponseWithMeta({ cryon: true }))).toBe(false);
    expect(hasLocalInferenceCapability(initializeResponseWithMeta({ cryon: null }))).toBe(false);
  });
});

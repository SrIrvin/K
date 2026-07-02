/**
 * logicService Facade
 * 
 * Aggregates and re-exports game state transition actions from modular domain-specific files.
 * This pattern preserves a single, simple entry point for state actions while keeping the
 * codebase highly atomic, decoupled, and clean.
 */

export * from './actions/gameSetup';
export * from './actions/selection';
export * from './actions/unitPlacement';
export * from './actions/unitMovement';
export * from './actions/specialCards';
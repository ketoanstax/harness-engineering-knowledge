import { z } from 'zod';

// --- Keyword Item Schema & Type ---
export const KeywordItemSchema = z.object({
  name: z.string(),
  definition: z.string(),
});
export type KeywordItem = z.infer<typeof KeywordItemSchema>;

// --- Mapped Data Schema & Type ---
export const MappedDataSchema = z.object({
  slug: z.string(),
  structured_slug: z.string(),
  title: z.string(),
  key_takeaways: z.array(z.string()),
  keywords: z.array(KeywordItemSchema),
});
export type MappedData = z.infer<typeof MappedDataSchema>;

// --- LLM Response Schema for Mapper Phase ---
export const LLMStructuredResponseSchema = z.object({
  title: z.string().optional().default(''),
  key_takeaways: z.array(z.string()).optional().default([]),
  keywords: z.array(KeywordItemSchema).optional().default([]),
  summary: z.string().optional().default(''),
});
export type LLMStructuredResponse = z.infer<typeof LLMStructuredResponseSchema>;

// --- Conflict Item Schema & Type ---
export const ConflictItemSchema = z.object({
  keyword: z.string(),
  existing_slug: z.string(),
  action: z.string(),
  reason: z.string(),
});
export type ConflictItem = z.infer<typeof ConflictItemSchema>;

// --- New Concept Item Schema & Type ---
export const NewConceptItemSchema = z.object({
  name: z.string(),
  suggested_slug: z.string(),
  definition: z.string(),
});
export type NewConceptItem = z.infer<typeof NewConceptItemSchema>;

// --- Reduced Data Schema & Type ---
export const ReducedDataSchema = z.object({
  conflicts: z.array(ConflictItemSchema),
  new_concepts: z.array(NewConceptItemSchema),
});
export type ReducedData = z.infer<typeof ReducedDataSchema>;

// --- New Node Output Schema & Type (forgiving with LLM null/undefined) ---
export const NewNodeOutputSchema = z.object({
  slug: z.string(),
  title: z.string(),
  category: z.string().optional().default('Harness Core Concept'),
  tags: z.array(z.string()).optional().default([]),
  definition: z.string().optional().default(''),
  principles: z.array(z.string()).optional().default([]),
  parent: z.preprocess((val) => (val === null ? undefined : val), z.string().optional()),
  children: z.array(z.string()).optional().default([]),
  causal_core: z.preprocess((val) => (val === null ? undefined : val), z.string().optional()),
  causal_supporting: z.array(z.string()).optional().default([]),
  causal_derivative: z.array(z.string()).optional().default([]),
});
export type NewNodeOutput = z.infer<typeof NewNodeOutputSchema>;

// --- Merge Node Output Schema & Type (forgiving with LLM null/undefined) ---
export const MergeNodeOutputSchema = z.object({
  slug: z.string(),
  updated_definition: z.preprocess((val) => (val === null ? undefined : val), z.string().optional()),
  added_principles: z.array(z.string()).optional().default([]),
  added_children: z.array(z.string()).optional().default([]),
  updated_causal_derivative: z.array(z.string()).optional().default([]),
});
export type MergeNodeOutput = z.infer<typeof MergeNodeOutputSchema>;

// --- Plan Result Schema & Type ---
export const PlanResultSchema = z.object({
  new_nodes: z.array(NewNodeOutputSchema),
  merge_nodes: z.array(MergeNodeOutputSchema),
  reasoning: z.string(),
});
export type PlanResult = z.infer<typeof PlanResultSchema>;

// --- Verification Result Schema & Type ---
export const VerificationResultSchema = z.object({
  brokenLinks: z.number(),
  portabilityViolations: z.number(),
  inconsistencies: z.number(),
});
export type VerificationResult = z.infer<typeof VerificationResultSchema>;

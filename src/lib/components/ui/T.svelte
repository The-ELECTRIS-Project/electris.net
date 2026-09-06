<script lang="ts">
  import type { Snippet } from 'svelte';
  import { dev } from '$app/environment';
  import { i18nState } from '$lib/state/i18n.svelte';
  import { parseRichText, type RichNode } from '$lib/utils/i18n';

  type SlotSnippet = Snippet<[Snippet]>;

  interface Props {
    key: string;
    fallback?: string;
    locale?: string;
    s0?: SlotSnippet;
    s1?: SlotSnippet;
    s2?: SlotSnippet;
    s3?: SlotSnippet;
    s4?: SlotSnippet;
    s5?: SlotSnippet;
    s6?: SlotSnippet;
    s7?: SlotSnippet;
    s8?: SlotSnippet;
    s9?: SlotSnippet;
  }

  let { key, fallback, locale, s0, s1, s2, s3, s4, s5, s6, s7, s8, s9 }: Props = $props();

  let nodes = $derived(parseRichText(i18nState.translateRich(key, fallback, locale)));
  let slots = $derived([s0, s1, s2, s3, s4, s5, s6, s7, s8, s9]);

  const warnedSlots = new Set<number>();

  function slotFor(index: number): SlotSnippet | undefined {
    const snippet = slots[index];
    if (snippet) return snippet;

    if (dev && !warnedSlots.has(index)) {
      warnedSlots.add(index);
      console.warn(`[i18n] Translation key "${key}" uses slot <${index}> but no s${index} snippet was passed`);
    }

    return undefined;
  }
</script>

{#snippet nodeList(list: RichNode[])}
  {#each list as node}
    {#if node.kind === 'text'}{node.value}
    {:else if node.kind === 'element'}
      {#if node.tag === 'br'}<br />
      {:else}<svelte:element this={node.tag}>{@render nodeList(node.children)}</svelte:element>{/if}
    {:else}
      {@const slot = slotFor(node.index)}
      {#snippet children()}{@render nodeList(node.children)}{/snippet}
      {#if slot}{@render slot(children)}{:else}{@render children()}{/if}
    {/if}
  {/each}
{/snippet}
{@render nodeList(nodes)}

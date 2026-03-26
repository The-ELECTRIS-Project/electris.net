<svelte:head>
  <title>NewHome | ELECTRIS</title>
  <meta property="og:title" content="NewHome" />
  <meta property="og:description" content="NewHome | A New Home for your browser"/>
  <meta property="og:url" content="https://new.electris.net/" />
  <meta name="twitter:title" content="NewHome"/>
  <meta name="twitter:description" content="NewHome | A New Home for your browser"/>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<script>
  let { children } = $props();
</script>

{@render children()}
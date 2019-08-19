<button on:click="{() => count += 1}">Clicked {count} times!</button>

<script lang="ts">
    export let count = 0;
</script>
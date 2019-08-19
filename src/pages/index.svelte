<script lang="ts">
    import Counter from "../components/Counter.svelte";
</script>

<h1>Hello <span class="name">Günther</span>!</h1>
<Counter />

<style lang="scss">
  h1 {
    color: red;

    .name 
    {
      color: black;
    }
  }
</style>
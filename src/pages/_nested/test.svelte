<script lang="ts">
export let id = "no id"
</script>

<h1>Hello <span class="name">{id}</span>!</h1>

<style lang="scss">
  h1 {
    color: red;

    .name 
    {
      color: black;
    }
  }
</style>
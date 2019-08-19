<script lang="ts">
export let test = "no id"
</script>

<h1>Hello <span class="name">{test}</span>!</h1>

<style lang="scss">
  h1 {
    color: red;

    .name 
    {
      color: black;
    }
  }
</style>
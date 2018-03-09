<template lang="html">
  <div class="">
    <ms :options="options" />
  </div>
</template>

<script>
import ms from 'src/components/modalSelect/index'

export default {
  data() {
    return {
      options:{
        list: [
          { test_id: "a0", test_type: "level0", test_label: "A0", test_pid: ""},
          { test_id: "a1", test_type: "level1", test_label: "A1", test_pid: "a0"},
          { test_id: "a2", test_type: "level0", test_label: "A2", test_pid: ""},
          { test_id: "a3", test_type: "level2", test_label: "A3", test_pid: "a1"},
          { test_id: "a3_1", test_type: "level2", test_label: "A3_1", test_pid: "a1"},
          { test_id: "a4", test_type: "level3", test_label: "A4", test_pid: "a3"},
        ],
        type: ["level0", "level1", "level2", "level3"],
        keyMap:{
          id:"test_id",
          pid:"test_pid",
          type:"test_type",
          label:"test_label",
        },
        defaultValue: { "level2": "a3,a3_1"},
        disabledItems: ["level0_a2"]
      }
    };
  },
  computed: {},
  ready() {},
  attached() {},
  methods: {},
  components: {ms},
};
</script>

<style lang="css">
</style>

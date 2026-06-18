<template>
  <GenericList doctype="Account" title="Chart of Accounts" singular="Account" base-edit-path="/banking/accounts" :total-fields="['balance']" />
</template>
<script setup>
import GenericList from '@/pages/GenericList.vue'
</script>

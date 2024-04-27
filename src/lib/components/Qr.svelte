<script lang="ts">
	export let qrUrl: string;
	export let size: number;
</script>

<img
	style="width: {size}px;"
	src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrUrl}`}
	alt="qr"
/>

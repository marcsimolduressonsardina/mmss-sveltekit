<script lang="ts">
	export let qrData: string;
	export let size: number;
</script>

<img
	style="width: {size}px;"
	src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`}
	alt="qr"
/>

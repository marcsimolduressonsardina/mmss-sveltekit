<script lang="ts">
	export let qrUrl: string;
	export let size: number;
</script>

<img
	src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrUrl}`}
	alt="qr"
/>

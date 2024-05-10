<script lang="ts">
	import { QRCodeImage } from 'svelte-qrcode-image';
	export let qrData: string;
	export let size: number;
</script>

<QRCodeImage text={qrData} displayWidth={size} margin={0} />

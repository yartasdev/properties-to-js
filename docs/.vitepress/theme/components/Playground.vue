<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
	convertProperties,
	type OutputType,
} from '../../utils/convertProperties';

const SAMPLE = `# Sample .properties
app.name=Properties to JS
app.version=2.0.0
app.debug=true

database.host=localhost
database.port=5432
`;

const input = ref(SAMPLE);
const outputType = ref<OutputType>('json');
const flatted = ref(false);
const delimiter = ref('.');
const uppercase = ref(false);
const lowercase = ref(false);
const error = ref('');
const copied = ref(false);

const outputTypes: { value: OutputType; label: string }[] = [
	{ value: 'json', label: 'JSON' },
	{ value: 'js', label: 'JavaScript' },
	{ value: 'ts', label: 'TypeScript' },
];

const output = computed(() => {
	error.value = '';
	try {
		if (uppercase.value && lowercase.value) {
			throw new Error('Uppercase and lowercase cannot both be enabled.');
		}
		return convertProperties({
			content: input.value,
			type: outputType.value,
			flatted: flatted.value,
			delimiter: delimiter.value || '.',
			uppercase: uppercase.value,
			lowercase: lowercase.value,
		});
	} catch (e) {
		error.value = (e as Error).message;
		return '';
	}
});

const inputStats = computed(() => {
	const lines = input.value ? input.value.split(/\r?\n/).length : 0;
	const chars = input.value.length;
	return { lines, chars };
});

watch(uppercase, (u) => {
	if (u) lowercase.value = false;
});
watch(lowercase, (l) => {
	if (l) uppercase.value = false;
});

function resetSample() {
	input.value = SAMPLE;
}

async function copyOutput() {
	if (error.value || !output.value) return;
	try {
		await navigator.clipboard.writeText(output.value);
		copied.value = true;
		window.setTimeout(() => {
			copied.value = false;
		}, 2000);
	} catch {
		// Clipboard API unavailable (e.g. non-secure context)
	}
}
</script>

<template>
	<div class="pg">
		<p class="pg__lead">
			<span class="pg__badge">Live</span>
			Type your .properties in the first box — converted output appears in the
			second. Same parse and nest logic as the CLI; formatting is simplified
			(no Prettier in the browser).
		</p>

		<section class="pg__options" aria-label="Conversion options">
			<div class="pg__options-row">
				<span class="pg__label">Output format</span>
				<div class="pg__segments" role="group">
					<button
						v-for="opt in outputTypes"
						:key="opt.value"
						type="button"
						class="pg__segment"
						:class="{ 'pg__segment--active': outputType === opt.value }"
						:aria-pressed="outputType === opt.value"
						@click="outputType = opt.value"
					>
						{{ opt.label }}
					</button>
				</div>
			</div>

			<div class="pg__options-row pg__options-row--toggles">
				<button
					type="button"
					class="pg__pill"
					:class="{ 'pg__pill--on': flatted }"
					:aria-pressed="flatted"
					@click="flatted = !flatted"
				>
					Flatten keys
				</button>
				<div v-show="flatted" class="pg__delimiter">
					<label class="pg__mini-label" for="pg-delimiter">Delimiter</label>
					<input
						id="pg-delimiter"
						v-model="delimiter"
						class="pg__delimiter-input"
						type="text"
						maxlength="4"
						aria-label="Delimiter for flattened keys"
					/>
				</div>
				<button
					type="button"
					class="pg__pill"
					:class="{ 'pg__pill--on': uppercase }"
					:aria-pressed="uppercase"
					@click="uppercase = !uppercase"
				>
					ABC uppercase
				</button>
				<button
					type="button"
					class="pg__pill"
					:class="{ 'pg__pill--on': lowercase, 'pg__pill--disabled': uppercase }"
					:aria-pressed="lowercase"
					:disabled="uppercase"
					@click="lowercase = !lowercase"
				>
					abc lowercase
				</button>
			</div>
		</section>

		<div class="pg__grid">
			<section class="pg__card" aria-label="Input">
				<header class="pg__card-head">
					<div class="pg__card-title">
						<span class="pg__dot pg__dot--in" aria-hidden="true" />
						<span>Input</span>
						<span class="pg__ext">.properties</span>
					</div>
					<div class="pg__card-meta">
						<span>{{ inputStats.lines }} lines</span>
						<span class="pg__meta-sep" aria-hidden="true">·</span>
						<span>{{ inputStats.chars }} chars</span>
					</div>
					<button type="button" class="pg__icon-btn" title="Reset sample" @click="resetSample">
						<svg
							class="pg__icon pg__icon--stroke"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						<span class="pg__icon-btn-text">Reset</span>
					</button>
				</header>
				<div class="pg__card-body">
					<textarea
						v-model="input"
						class="pg__textarea"
						spellcheck="false"
						aria-label="Properties content"
					/>
				</div>
			</section>

			<section class="pg__card pg__card--out" aria-label="Output">
				<header class="pg__card-head">
					<div class="pg__card-title">
						<span class="pg__dot pg__dot--out" aria-hidden="true" />
						<span>Output</span>
						<span class="pg__ext">{{ outputType }}</span>
					</div>
					<button
						type="button"
						class="pg__copy"
						:disabled="!!error || !output"
						@click="copyOutput"
					>
						<svg v-if="!copied" class="pg__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path d="M8 2a2 2 0 00-2 2v1H5a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2v-1h1a2 2 0 002-2V4a2 2 0 00-2-2H8zm0 1h5a1 1 0 011 1v5h-1a2 2 0 00-2-2H7V4a1 1 0 011-1zM5 6h6a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" />
						</svg>
						<svg v-else class="pg__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
						</svg>
						{{ copied ? 'Copied' : 'Copy' }}
					</button>
				</header>
				<div class="pg__card-body">
					<div v-if="error" class="pg__error" role="alert">
						<strong class="pg__error-title">Could not convert</strong>
						<p class="pg__error-msg">{{ error }}</p>
					</div>
					<textarea
						v-else
						:value="output"
						readonly
						class="pg__textarea pg__textarea--out"
						spellcheck="false"
						aria-label="Converted output"
					/>
				</div>
			</section>
		</div>
	</div>
</template>

<style scoped>
.pg {
	--pg-radius: 12px;
	--pg-radius-sm: 8px;
	--pg-border: var(--vp-c-divider);
	--pg-surface: var(--vp-c-bg-soft);
	--pg-surface-elevated: var(--vp-c-bg);
	--pg-accent: var(--vp-c-brand-1);
	--pg-accent-soft: var(--vp-c-brand-soft);

	margin: 1.25rem 0 2rem;
}

.pg__lead {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.65rem 1rem;
	margin: 0 0 1.25rem;
	padding: 0.85rem 1.1rem;
	font-size: 0.9rem;
	line-height: 1.55;
	color: var(--vp-c-text-2);
	background: linear-gradient(
		135deg,
		var(--vp-c-bg-soft) 0%,
		color-mix(in srgb, var(--vp-c-brand-soft) 35%, var(--vp-c-bg-soft)) 100%
	);
	border: 1px solid var(--pg-border);
	border-radius: var(--pg-radius);
}

.pg__badge {
	display: inline-flex;
	align-items: center;
	padding: 0.2rem 0.55rem;
	font-size: 0.68rem;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--vp-c-brand-1);
	background: var(--pg-accent-soft);
	border-radius: 999px;
	border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 25%, transparent);
	flex-shrink: 0;
}

.pg__options {
	padding: 1rem 1.15rem;
	margin-bottom: 1rem;
	background: var(--pg-surface-elevated);
	border: 1px solid var(--pg-border);
	border-radius: var(--pg-radius);
	box-shadow: 0 1px 2px color-mix(in srgb, var(--vp-c-text-1) 4%, transparent);
}

.pg__options-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.75rem 1.25rem;
}

.pg__options-row + .pg__options-row {
	margin-top: 1rem;
	padding-top: 1rem;
	border-top: 1px solid var(--pg-border);
}

.pg__label {
	font-size: 0.72rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--vp-c-text-3);
	min-width: 7rem;
}

.pg__segments {
	display: inline-flex;
	padding: 3px;
	background: var(--vp-c-bg-soft);
	border-radius: 10px;
	border: 1px solid var(--pg-border);
	gap: 2px;
}

.pg__segment {
	margin: 0;
	padding: 0.45rem 1rem;
	font-size: 0.8125rem;
	font-weight: 600;
	font-family: var(--vp-font-family-base);
	color: var(--vp-c-text-2);
	background: transparent;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	transition:
		background 0.15s ease,
		color 0.15s ease;
}

.pg__segment:hover {
	color: var(--vp-c-text-1);
	background: color-mix(in srgb, var(--vp-c-bg) 60%, transparent);
}

.pg__segment--active {
	color: var(--vp-button-brand-text, var(--vp-c-white));
	background: var(--pg-accent);
	box-shadow: 0 1px 2px color-mix(in srgb, var(--vp-c-text-1) 12%, transparent);
}

.pg__options-row--toggles {
	align-items: center;
	gap: 0.6rem 0.85rem;
}

.pg__pill {
	margin: 0;
	padding: 0.45rem 0.95rem;
	font-size: 0.8125rem;
	font-weight: 600;
	font-family: var(--vp-font-family-base);
	color: var(--vp-c-text-2);
	background: var(--vp-c-bg-soft);
	border: 1px solid var(--pg-border);
	border-radius: 999px;
	cursor: pointer;
	transition:
		border-color 0.15s ease,
		background 0.15s ease,
		color 0.15s ease;
}

.pg__pill:hover:not(:disabled) {
	border-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, var(--pg-border));
	color: var(--vp-c-text-1);
}

.pg__pill--on {
	color: var(--vp-button-brand-text, var(--vp-c-white));
	background: var(--pg-accent);
	border-color: color-mix(in srgb, var(--vp-c-brand-1) 50%, var(--pg-border));
}

.pg__pill--disabled {
	opacity: 0.45;
	cursor: not-allowed;
}

.pg__delimiter {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-left: 0.25rem;
	animation: pg-fade-in 0.2s ease;
}

@keyframes pg-fade-in {
	from {
		opacity: 0;
		transform: translateY(-3px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.pg__mini-label {
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--vp-c-text-3);
	white-space: nowrap;
}

.pg__delimiter-input {
	width: 3rem;
	padding: 0.35rem 0.45rem;
	font-family: var(--vp-font-family-mono);
	font-size: 0.85rem;
	text-align: center;
	border-radius: 8px;
	border: 1px solid var(--pg-border);
	background: var(--vp-c-bg);
	color: var(--vp-c-text-1);
}

.pg__delimiter-input:focus {
	outline: none;
	border-color: var(--pg-accent);
	box-shadow: 0 0 0 2px var(--pg-accent-soft);
}

.pg__grid {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	align-items: stretch;
}

.pg__card {
	display: flex;
	flex-direction: column;
	min-height: 260px;
	background: var(--pg-surface-elevated);
	border: 1px solid var(--pg-border);
	border-radius: var(--pg-radius);
	overflow: hidden;
	box-shadow:
		0 1px 2px color-mix(in srgb, var(--vp-c-text-1) 4%, transparent),
		0 12px 28px -18px color-mix(in srgb, var(--vp-c-text-1) 18%, transparent);
}

.pg__card--out .pg__card-body {
	background: linear-gradient(
		180deg,
		color-mix(in srgb, var(--vp-c-bg-soft) 80%, var(--vp-c-bg)) 0%,
		var(--vp-c-bg) 48%
	);
}

.pg__card-head {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.5rem 0.75rem;
	padding: 0.65rem 0.85rem;
	background: var(--pg-surface);
	border-bottom: 1px solid var(--pg-border);
}

.pg__card-title {
	display: flex;
	align-items: center;
	gap: 0.45rem;
	font-size: 0.8125rem;
	font-weight: 700;
	color: var(--vp-c-text-1);
	flex: 1;
	min-width: 0;
}

.pg__dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	flex-shrink: 0;
}

.pg__dot--in {
	background: linear-gradient(135deg, #38bdf8, #6366f1);
	box-shadow: 0 0 0 2px color-mix(in srgb, #38bdf8 35%, transparent);
}

.pg__dot--out {
	background: linear-gradient(135deg, var(--vp-c-brand-1), color-mix(in srgb, var(--vp-c-brand-1) 65%, #22c55e));
	box-shadow: 0 0 0 2px var(--pg-accent-soft);
}

.pg__ext {
	font-family: var(--vp-font-family-mono);
	font-size: 0.72rem;
	font-weight: 600;
	color: var(--vp-c-text-3);
	padding: 0.15rem 0.45rem;
	background: var(--vp-c-bg);
	border: 1px solid var(--pg-border);
	border-radius: 6px;
}

.pg__card-meta {
	font-size: 0.72rem;
	color: var(--vp-c-text-3);
	font-variant-numeric: tabular-nums;
	display: flex;
	align-items: center;
	gap: 0.35rem;
}

.pg__meta-sep {
	opacity: 0.5;
}

.pg__icon-btn {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	margin-left: auto;
	padding: 0.35rem 0.6rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--vp-c-text-2);
	background: transparent;
	border: 1px solid transparent;
	border-radius: 8px;
	cursor: pointer;
	transition:
		background 0.15s ease,
		color 0.15s ease,
		border-color 0.15s ease;
}

.pg__icon-btn:hover {
	color: var(--vp-c-text-1);
	background: var(--vp-c-bg);
	border-color: var(--pg-border);
}

.pg__icon-btn-text {
	display: none;
}

@media (min-width: 480px) {
	.pg__icon-btn-text {
		display: inline;
	}
}

.pg__icon {
	width: 1rem;
	height: 1rem;
	flex-shrink: 0;
}

.pg__icon--stroke {
	width: 1.1rem;
	height: 1.1rem;
}

.pg__copy {
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	margin-left: auto;
	padding: 0.4rem 0.75rem;
	font-size: 0.75rem;
	font-weight: 600;
	font-family: var(--vp-font-family-base);
	color: var(--vp-button-brand-text, var(--vp-c-white));
	background: var(--pg-accent);
	border: none;
	border-radius: 8px;
	cursor: pointer;
	transition: opacity 0.15s ease, transform 0.12s ease;
}

.pg__copy:hover:not(:disabled) {
	opacity: 0.92;
	transform: translateY(-1px);
}

.pg__copy:disabled {
	opacity: 0.38;
	cursor: not-allowed;
	transform: none;
}

.pg__card-body {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
}

.pg__textarea {
	flex: 1;
	width: 100%;
	min-height: 280px;
	margin: 0;
	padding: 1rem 1.05rem;
	font-family: var(--vp-font-family-mono);
	font-size: 0.8125rem;
	line-height: 1.6;
	border: none;
	resize: vertical;
	background: transparent;
	color: var(--vp-c-text-1);
	tab-size: 2;
}

.pg__textarea:focus {
	outline: none;
	box-shadow: inset 0 0 0 2px var(--pg-accent-soft);
}

.pg__textarea--out {
	resize: vertical;
	min-height: 220px;
	max-height: min(48vh, 520px);
	cursor: default;
	white-space: pre;
	overflow-wrap: normal;
	overflow-x: auto;
}

.pg__textarea--out:focus {
	box-shadow: none;
}

.pg__error {
	padding: 1rem 1.1rem;
	margin: 0.75rem;
	border-radius: var(--pg-radius-sm);
	background: color-mix(in srgb, var(--vp-c-danger-1) 10%, var(--vp-c-bg));
	border: 1px solid color-mix(in srgb, var(--vp-c-danger-1) 28%, var(--pg-border));
}

.pg__error-title {
	display: block;
	font-size: 0.8rem;
	font-weight: 700;
	color: var(--vp-c-danger-1);
	margin-bottom: 0.35rem;
}

.pg__error-msg {
	margin: 0;
	font-size: 0.8125rem;
	line-height: 1.5;
	color: var(--vp-c-text-2);
	font-family: var(--vp-font-family-mono);
}
</style>

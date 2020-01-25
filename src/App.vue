<template>
    <div class="container my-5 mx-auto">
        <h1>
            Fallout Hacking Solver
            <a
                class="btn btn-outline-primary float-right"
                href="https://lixquid.com"
                >lixquid.com</a
            >
        </h1>

        <small class="text-muted">
            <p>
                Add guesses by entering the word attempted and the reported
                likeness, like so: <code>attempt likeness</code>. For example:
                <code>ARCHITECTS 3</code>
            </p>
            <p>
                Press <kbd>Enter</kbd> to submit the guess. Press
                <kbd>Ctrl + Space</kbd> to autocomplete the first potential
                word. Press <kbd>Ctrl + C</kbd> to clear the input.
            </p>
        </small>

        <div class="input-group mt-5">
            <input
                class="form-control form-control-lg"
                :class="{ 'is-invalid': inputError }"
                v-model="input"
                ref="inputRef"
                placeholder="word likeness"
                v-on:keyup.enter.exact.passive="addGuess"
                v-on:keyup.space.ctrl.prevent="autocomplete"
                v-on:keyup.c.ctrl.prevent="input = ''"
            />
            <div class="input-group-append">
                <button class="btn btn-primary" v-on:click.passive="addGuess">
                    Add
                </button>
            </div>
        </div>
        <input
            class="form-control mt-3"
            placeholder="Potential words will appear here"
            disabled
            :value="potentials"
        />

        <div class="card-deck mt-3">
            <div class="card">
                <div class="card-header">Possible Words</div>
                <div class="card-body">
                    <ul>
                        <li v-for="(word, i) in wordsLeft" :key="i">
                            {{ word }}
                        </li>
                    </ul>
                </div>
            </div>
            <div class="card">
                <div class="card-header">Previous Guesses</div>
                <div class="card-body">
                    <ul>
                        <li v-for="(guess, i) in guesses" :key="i">
                            {{ guess[0] }}, {{ guess[1] }}
                            <a
                                href="#"
                                class="text-danger"
                                v-on:click.prevent="guesses.splice(i, 1)"
                            >
                                &times;
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="text-right w-100 mt-3">
            <button
                class="btn btn-danger"
                :disabled="!guesses.length"
                v-on:click.passive="resetAll"
            >
                Reset All
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import wordList from "./wordlist.json";
import { createComponent, ref, reactive, computed } from "@vue/composition-api";
import jQuery from "jquery";
import "bootstrap";

const guessRegex = /^([a-z]+) +(\d+)$/i;
const flatWordList = Object.values(wordList).flatMap(a => a);

export default createComponent({
    setup() {
        const input = ref("");
        const inputRef = ref<null | HTMLInputElement>(null);
        const inputError = ref(false);
        const guesses = ref<[string, number][]>([]);

        function likeness(word1: string, word2: string): number {
            let output = 0;
            for (let i = 0; i < word1.length; i++) {
                if (word1[i] === word2[i]) output++;
            }
            return output;
        }

        const wordsLeft = computed(() => {
            if (!guesses.value.length) return [];
            const wordLength = guesses.value[0][0].length;
            if (!wordList[("" + wordLength) as keyof typeof wordList]) {
                // No words are of that length
                return [];
            }
            return wordList[("" + wordLength) as keyof typeof wordList].filter(
                word => {
                    for (const guess of guesses.value) {
                        if (likeness(word, guess[0]) !== guess[1]) {
                            return false;
                        }
                    }
                    return true;
                }
            );
        });

        const potentials = computed(() => {
            if (input.value === "") {
                return [];
            }
            return (guesses.value.length
                ? wordsLeft.value
                : flatWordList
            ).filter(w =>
                w.startsWith(input.value.split(" ")[0].toUpperCase())
            );
        });

        function autocomplete(): void {
            if (!potentials.value.length) return;
            input.value = potentials.value[0];
        }

        function showError(value: string): void {
            inputError.value = true;
            if (!inputRef.value) {
                return;
            }
            jQuery(inputRef.value)
                .tooltip({
                    title: value,
                    html: true
                })
                .tooltip("show");
        }

        function addGuess(): void {
            const result = guessRegex.exec(input.value);

            // Invalid input
            if (result === null) {
                showError(
                    "Guesses should be in the form: <code>guess likeness</code><br />For example: <code>ARCHITECTS 3</code>"
                );
                return;
            }

            // Doesn't match original guess length
            if (
                guesses.value.length &&
                guesses.value[0][0].length !== result[1].length
            ) {
                showError("Guess doesn't match original guess length");
                return;
            }

            // Already guessed
            if (guesses.value.some(g => g[0] === result[1].toUpperCase())) {
                showError("This guess has already been added");
                return;
            }

            inputError.value = false;
            if (inputRef.value) {
                jQuery(inputRef.value).tooltip("dispose");
            }
            guesses.value.push([result[1].toUpperCase(), parseInt(result[2])]);
            input.value = "";
        }

        function resetAll(): void {
            guesses.value = [];
            input.value = "";
            inputError.value = false;
        }

        return {
            addGuess,
            autocomplete,
            guesses,
            input,
            inputError,
            inputRef,
            potentials,
            resetAll,
            wordList,
            wordsLeft
        };
    }
});
</script>

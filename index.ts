import fs from 'fs';
import process from 'process';
import { Provider, ProviderOptions, constants } from 'starknet';

import { AsyncQueue, Mutex } from './async_queue';

import { randomIntFromInterval } from './utils';
import { Config } from './config';

import { Dmail } from './dmail';

// Ignore promise rejection
process.on('unhandledRejection', (err) => {
    console.log('\n!!!!! An unhandledRejection occurred !!!!! \n');
    console.log(`!!! Rejection: ${err}`);
});

class DmailSender {
    private dmail: Dmail;

    constructor() {
        this.dmail = new Dmail(
            this.initProvider()
        );

        void this.initProcessing(
            this.populateProcessQueue(
                this.loadWallets()
            )
        );
    }

    private initProvider(): Provider {
        const providerOptions: ProviderOptions = {
            sequencer: { network: constants.NetworkName.SN_MAIN }
        };

        if (Config.nodeUrl) {
            providerOptions.rpc = { nodeUrl: Config.nodeUrl };
        }

        return new Provider(providerOptions);
    }

    private loadWallets(): string[] {
        try {
            const wallets = fs
                .readFileSync('./private_keys.txt', { encoding: 'utf-8' })
                .split('\n')
                .filter(Boolean);

            return this.shuffleArray(wallets);
        } catch (err) {
            throw Error('Failed to load wallets!');
        }
    }

    private populateProcessQueue(wallets: string[]) {
        const queue = [];

        for (const wallet of wallets) {
            const asyncQueue = new AsyncQueue(new Mutex());
            const swapCount = randomIntFromInterval(Config.minMsgCount, Config.maxMsgCount);

            for (let i = 1; i <= swapCount; i++) {
                asyncQueue.add(() => this.dmail.send(wallet));
            }

            queue.push(asyncQueue);
        }

        return queue;
    }

    private async initProcessing(queue) {
        if (Config.nodeUrl) {
            console.log('=== Custom node mode ===');
        }
        console.log(`Start processing...wallets count - ${queue.length} \n\n`);

        await Promise.allSettled(queue);
    }

    private shuffleArray<T>(array: T[]): T[] {
        const copyTokensArray = array;
        let currentIndex = copyTokensArray.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [copyTokensArray[currentIndex], copyTokensArray[randomIndex]] = [copyTokensArray[randomIndex], copyTokensArray[currentIndex]];
        }

        return copyTokensArray;
    }
}


const dmail = new DmailSender();
import { Provider, Account, CallData, shortString } from "starknet";
import { generateSlug } from "random-word-slugs";

import { getArgentAddressNew, sleep, timeout, getRandomDomain } from "./utils";
import { Config } from "./config";

const dmailAddress = '0x0454f0bd015e730e5adbb4f080b075fdbf55654ff41ee336203aa2e1ac4d4309';

export class Dmail {
    provider: Provider;

    constructor(provider: Provider) {
        this.provider = provider;
    }

    async send(privateKey: string) {
        await timeout();

        const address = getArgentAddressNew(privateKey);

        const account = new Account(this.provider, address, privateKey, '1');

        const email = generateSlug(2, { format: "camel" }) + '@' + getRandomDomain();
        const topic = generateSlug(1, { format: "title" });

        try {    
            const multiCall = await account.execute({
                contractAddress: dmailAddress,
                entrypoint: "transaction",
                calldata: CallData.compile({
                    to: shortString.encodeShortString(email),
                    theme: shortString.encodeShortString(topic)
                }),
            });

            if (Config.nodeUrl) {
                await sleep(60000 * 2); // 2 min to sync custom node
            }
            
            const receipt = await this.provider.waitForTransaction(multiCall.transaction_hash);

            if (receipt && receipt['transaction_failure_reason']) {
                console.log(`ERROR for wallet ${address} ->`, receipt['transaction_failure_reason']);
            }

            if (receipt && receipt['execution_status'] === 'SUCCEEDED') {
                console.log(`SUCCESS send mail to ${email} for wallet ${address} hash:`, `https://starkscan.co/tx/${multiCall.transaction_hash}`);
            }
        } catch (error) {
            console.log(`Error for wallet ${address} : ${error.message}`);
        } finally {
            await timeout();
        }
    }
}
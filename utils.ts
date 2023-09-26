import { ec, hash, CallData } from 'starknet';

import { Config } from './config';

export const sleep = (timeout = 500) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
};

export async function timeout() {
    const maxDelay = Config.minDelay;
    const minDelay = Config.maxDelay;
    const delayTime = Math.floor(Math.random() * (maxDelay * 60000 - minDelay * 60000 + 1) + minDelay * 60000);
    await new Promise(resolve => setTimeout(resolve, delayTime));
}

export const randomIntFromInterval = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomDomain = () => {
    const domain = ['gmail.com', 'hotmail.com', 'rambler.ru', 'mail.ru', 'yandex.ru'];

    const randIndex = Math.floor(Math.random() * domain.length);
    return domain[randIndex];
}

export const getArgentAddressNew = (privateKey) => {
    const publicKey = ec.starkCurve.getStarkKey(privateKey);
    const constructorCalldata = CallData.compile({
        owner: publicKey,
        guardian: 0n
    });

    return hash.calculateContractAddressFromHash(
        publicKey,
        "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
        constructorCalldata,
        0
    );
};
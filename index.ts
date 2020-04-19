import { highlight } from 'hexo-util';
import { request } from 'https';
import pkg from './package.json';

const name = pkg.name;
const version = pkg.version;

// ts-ignore because @types/hexo is wrong as usual u.u
// @ts-ignore
hexo.extend.tag.register('github_include', async (args) => {
    const path = args[0];
    if (!path) {
        throw new Error(`github_include requires a path`);
    }
    const lang = args[1];
    const url = `https://raw.githubusercontent.com/${path}`;
    // case because error will be thrown
    const code = await httpGet(url) as string;

    // TODO: check config for highlight so we don't unconditionally do so?
    //       unwashed if you don't highlight tbh
    // attempt to autodetect if not provided
    return highlight(
        code, 
        { lang, autoDetect: lang ? false : true }
    );    
}, { async: true });

function httpGet(url: string) {
    if (!url.startsWith('https://')) url = `https://${url}`;
    const options = {
        headers: {
            'User-Agent': `${name}@${version}`
        }
    }
    return new Promise((resolve, reject) => {
        const req = request(url, options, (res) => {
            if (res.statusCode! < 200 || res.statusCode! >= 400) {
                reject(new Error(`Fetching ${url} returned status code ${res.statusCode} ${res.statusMessage}.`));
            }
            const chunks: any[] = [];
            res.on('error', (e) => reject(e));
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
                const allChunks = Buffer.concat(chunks).toString();
                resolve(allChunks);
            });
        });

        req.end();
    })
}

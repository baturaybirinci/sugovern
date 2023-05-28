// pages/api/download.js
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { serverRuntimeConfig } from '../../../next.config';
import * as path from "path";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const filePath = path.join(process.cwd(), 'constant.js');
        console.log(filePath);
        let file;
        try {
            file = await readFile(filePath);
        } catch (err) {
            res.status(404).send('File not found');
            return;
        }

        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Content-Disposition', 'attachment; filename=constant.js');
        res.send(file);
    } else {
        res.status(405).send('Method not allowed');
    }
}

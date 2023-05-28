// pages/api/updateConstant.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { key, newValue } = req.body;

    // Load the current constants
    let constants = require('../../../constant');

    // Update the constant
    constants[key] = newValue;

    // Convert back to a string
    let output = 'export const CONSTANT_DICT = ' + JSON.stringify(constants, null, 2);

    // Write to the file
    fs.writeFile(path.resolve('./constant.js'), output, 'utf8', function(err) {
      if (err) {
        res.status(500).send({ message: 'Error writing to file' });
      } else {
        res.status(200).send({ message: 'Successfully updated constant' });
      }
    });
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import * as dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import process from 'node:process';
import cors from 'cors';
import path, { dirname } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const app = express();

const corsOptions = {
  origin:'*',
  credentials:true,
  optionSuccessStatus:200,
};

const __dirname = dirname('./');
const scoreboardPath = path.resolve(__dirname, 'scoreboard.json');

app.use(express.json());
app.use(cors(corsOptions));


app.patch('/api/scoreboard', (req, res) => {
  const newUser = req.body;

  const json1 = readFileSync(scoreboardPath, 'utf8');
  const object = JSON.parse(json1);

  object.scoreboard.splice(newUser.place - 1, 0, newUser);
  object.scoreboard.pop();
  for(let i = newUser.place; i < object.scoreboard.length; i++) {
    object.scoreboard[i].place++;
  }

  const json2 = JSON.stringify(object);
  writeFileSync(scoreboardPath, json2);

  res.sendFile(scoreboardPath);
});

app.get('/api/scoreboard', (req, res) => {
  res.sendFile(scoreboardPath);
});

app.get('*', (req, res) => {
  res.status(404).json('Not found');
});

app.listen(process.env.ALWAYSDATA_HTTPD_PORT, process.env.ALWAYSDATA_HTTPD_IP, () => console.log(`Server is up Port is ${process.env.ALWAYSDATA_HTTPD_PORT} IP is ${process.env.ALWAYSDATA_HTTPD_IP}`));

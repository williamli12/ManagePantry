import * as dotenv from 'dotenv'; //this file doesnt do anything, it was just a test file
dotenv.config();

import { OpenAI } from "openai"; 
const openai = new OpenAI();

import fs from "fs";
const base64Image = fs.readFileSync("images/grocery_basket.jpg", {
    encoding: "base64",
});

const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", //gpt-3.5-turbo the generic model
    messages: [ //gpt-4-vision-preview the url model
        {//improve quanlity of response
            role: "system",
            content: [
                {
                    type: "text",
                    text: "Return a JSON structure based on the requirements of the user. Only return the JSON structure, nothing else. Do not return ```json",
                },
            ],
        },
        {
            role:"user",
            content: [
                {
                type: "text",
                text: "Create a JSON structure for all the items and its quantity showed on the picture",
                },
                {
                    type: "image_url",
                    image_url: { //can convert image into a base 64 representation
                        url: `data:image/jpg:base64,${base64Image}`,
                        //detail: "low", //lower resolution to resize for lesser tokens
                    },
                },
            ],
        },
    ],
    max_tokens: 1000, //increase token response
});

console.log(response.choices[0].message.content);

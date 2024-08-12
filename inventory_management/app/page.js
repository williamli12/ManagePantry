'use client' //client side app
import Image from "next/image"
import {useState, useEffect} from 'react'
import {firestore} from '@/firebase'
import { Box, Button, Modal, Stack, styled, TextField, Typography } from "@mui/material"
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore"

import * as dotenv from 'dotenv';
dotenv.config();

import pica from 'pica';
import { OpenAI, OpenAIApi } from "openai"; 
//const openai = require('openai');

//import fs from "fs";

import axios from "axios"
//import { toBase64 } from "openai/core"
//import { Istok_Web } from "next/font/google"
//import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export default function Home() {
  const [inventory, setInventory] = useState([]) //inventory management helper function = empty array
  const [open, setOpen] = useState(false) //add and remove emtpy array to default value
  const [itemName, setItemName] = useState('') //itemname to store names = empty string
  const [selectedFile, setSelectedFile] = useState(null); //store files
  const [base64File, setBase64File] = useState(null);
  const [jsonResponse, setJsonResponse] = useState(null);

  const updateInventory = async () => { //function to update to firebase, async to prevent blocking from fetching
    const snapshot = query(collection(firestore, 'inventory')) //snapshot of the collection using a query
    const docs = await getDocs(snapshot) //the document sub collection
    const inventoryList = []

    docs.forEach((doc)=> { //for each element in docs. add it to inventory list
      inventoryList.push({ //push a new object where name is id of docs and docs data
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
    //console.log(inventoryList)
  }

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
  setSelectedFile(file);

  try {
    const base64 = await toBase64(file);
    setBase64File(base64);

    const jsonResponse = await getJSONFromImage(base64);
    setJsonResponse(jsonResponse);

    Object.keys(jsonResponse).forEach(key => {
      const newJson = jsonResponse[key];
      newJson.forEach((element) => {

        const name = element["name"].toString();
        const quantity = Number(element["quantity"]);

        setItemName(name);

        if (quantity == 1) {
          addItem(name, 1);
        } else {
        for (let i = 0; i < quantity - 1; i++) {
          addItem(name, quantity);
          
          //setItemName('');
         
        }}
        setItemName('');
        });
    });

  } catch (error) {
    console.error('Error encoding file:', error);
  }
  }

 

  const getJSONFromImage = async (base64Image) => {
    
    const openai = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!openai) {
      console.error('API key is missing');
      return null;
    }
    try {

      console.log("fjsafui");
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Return a JSON structure based on the requirements of the user. Only return the JSON structure, nothing else. Do not return ```json."
            },
            {
              role: "user",
              content: [
                {type: "text",
                text: `Create a JSON structure for all the food names and their quantity shown in the picture. Here is the image data: data:image/jpg;base64,${base64Image}`}
          ]}
          ],
          max_tokens: 1000
        })
      });
      
      const data = await response.json();
      console.log('API Response:', data);

      if (response.status !== 200) {
        throw new Error(`API error: ${response.status} - ${data.error.message}`);
      }
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No choices returned in the API response');
      }
      console.log(data.choices[0].message.content)
      const jsonResponse = JSON.parse(data.choices[0].message.content);
      
      console.log(jsonResponse);
      return jsonResponse;
    } catch (error) {
      console.error('Error fetching JSON from image:', error);
      return null; // Handle the error gracefully in your UI
    }
  };


  const addItem = async (item, number) =>{ 
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef) //gets it if exists

    if(docSnap.exists()){
      console.log("tyty");
      const {quantity} = docSnap.data()   
      await setDoc(docRef, {quantity: quantity + 1}) //set the docref to be the quantity where quan = quan + 1
    }
    else {
      console.log("tytsd");
      if (number > 0) {
        await setDoc(docRef, {quantity: number})}
      else {
        await setDoc(docRef, {quantity: 1})
      }
    }
    await updateInventory()
  }

  const removeItem = async (item) =>{ 
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef) //gets it if exists

    if(docSnap.exists()){
      const {quantity} = docSnap.data() //this is the quantity of the data
      if(quantity === 1) { //=== compares values without type conversion
        await deleteDoc(docRef) //the quantity refers to the quantity of the collection of fields
      }
      else {
        await setDoc(docRef, {quantity: quantity - 1}) //set the docref to be the quantity where quan = quan - 1
      }
    }

    await updateInventory() //await is like a promise based behavior
  }

  useEffect(() => { //runs updateinventory whenever something in dependency array changes, nothing in there so only runs once
    updateInventory() //meaning only updates when the page loads
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  
  return ( //box is most basic like a dev
    <Box
      width="100vw"
      height = "100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          //transform="translate(-50%, -50%)"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography 
            variant="h6"
          >
            Add Item
          </Typography>
          <Stack
            width="100%"
            direction="row"
            spacing={2}
          >
            <TextField
              variant="outlined"
              fillWidth
              value={itemName}
              onChange={(e)=>{
                setItemName(e.target.value)
              }}
            >
            </TextField>
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box
        display="flex"
        justifyContent="space-between"

      >
      <Button 
        variant="contained"
        onClick={() => {
          handleOpen()
        }}
      >
        Add New Item
      </Button>



      <Button  //this is for the openai
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        //startIcon={<CloudUploadIcon />}
        
      >
        Upload File
        <VisuallyHiddenInput type="file" onChange={handleFileUpload}/>
      </Button> 

      </Box>

      {jsonResponse && (
        <Box mt={2}>
          <Typography variant="body1">
            JSON Response: {JSON.stringify(jsonResponse, null, 2)}
          </Typography>
        </Box>
      )}

      <Box
        border='1px solid #333'
      >
        <Box
          width="800px"
          height="100px"
          bgcolor="#ADD8E6"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h2"
            color="#333"
          >
            Inventory Items
          </Typography>
        </Box>
      
      <Stack
        width="800px"
        height="300px"
        spacing={2}
        overflow="auto"
      >
        {
        inventory.map(({name, quantity})=>(
          <Box
            key={name}
            width="100%"
            minHeight= "150px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgcolor="#f0f0f0"
            padding={5}
          >
            <Typography
              variant="h3"
              color='#333'
              textAlign='center'
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>

            <Typography
              variant="h3"
              color='#333'
              textAlign='center'
            >
              {quantity}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
            >
            <Button
              variant="contained"
              onClick={()=>{
                removeItem(name)
              }}
            >
              Remove
            </Button>

            <Button
              variant="contained"
              onClick={()=>{
                addItem(name)
              }}
            >
              Add
            </Button>
            </Stack></Box>
        )) //dont need curly brackets if not returning anything
        }
      </Stack>
      </Box>
    </Box> //typography looks at the text, stack is like a box but puts everything in stack
  )
}

'use client' //client side app
import Image from "next/image"
import {useState, useEffect} from 'react'
import {firestore} from '@/firebase'
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material"
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore"
//import { Istok_Web } from "next/font/google"

export default function Home() {
  const [inventory, setInventory] = useState([]) //inventory management helper function = empty array
  const [open, setOpen] = useState(false) //add and remove emtpy array to default value
  const [itemName, setItemName] = useState('') //itemname to store names = empty string
  
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

  //helper funcs
  const addItem = async (item) =>{ 
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef) //gets it if exists

    if(docSnap.exists()){
      const {quantity} = docSnap.data()   
      await setDoc(docRef, {quantity: quantity + 1}) //set the docref to be the quantity where quan = quan - 1
    }
    else {
      await setDoc(docRef, {quantity: 1})
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
      <Button 
        variant="contained"
        onClick={() => {
          handleOpen()
        }}
      >
        Add New Item
      </Button>
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
            bgColor="#f0f0f0"
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

const express = require("express");
const router = express.Router();
const stripe = require("stripe")(
  "sk_test_51IdwfeH8KzFo5uc9YHKzp2HOPkZJvH0ij0qhWeg0wQ17G73o5fVJYjMkWOfAmWUgjVZe0DesJvrQKbmAPSacXsVP00qMXnEqFr"
);
const { v4: uuidv4 } = require("uuid");
let nodeGeocoder = require('node-geocoder')

// Getting Module
const Products_Model = require("../models/Products");
const MainStore_Model = require("../models/MainStore");
const FeaturedProduct_Model = require("../models/FeaturedProduct");
const Profile_Model = require("../models/Profile")
const Agreement_Model = require("../models/Agreement")

let options = {
  provider: 'openstreetmap',
}

let geoCoder = nodeGeocoder(options)

// Geolocation
router.get('/get_location/:latitude/:longitude', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  const { latitude, longitude } = req.params

  geoCoder
    .reverse({ lat: Number(latitude), lon: Number(longitude) })
    .then((res2) => {
      res.status(201).json(res2[0])
    })
    .catch((err) => {
      console.log(err)
    })
})

// TEST
// @GET TEST
// GET
router.get("/test", (req, res) => {
  res.send("Working");
});

// TEST
router.post("/profiles/test", async (req, res) => {
  res.json(req.body)
})

// Database CRUD Operations
// Post a new profile
// POST
router.post("/profiles", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  const newProfile = new Profile_Model({
    title: req.body.title,
    landlordName: req.body.landlordName,
    city: req.body.city,
    state: req.body.state,
    pincode: req.body.pincode,
    address1: req.body.address1,
    address2: req.body.address2,
    createdOn: req.body.createdOn,
    userId: req.body.userId
  });

  newProfile.save((err) => {
    if (err)
      res.status(400).json(`Error: ${err}`)
    else
      res.status(200).send("created a new profile")
  })
})

// Database CRUD Operations
// Get all the profiles corresponding to an userId
// GET
router.get("/profiles/:userId", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  Profile_Model.find({ userId: req.params.userId }, (err, profiles) => {
    if (err)
      res.status(400).json(`Error: ${err}`)
    else
      res.status(200).json(profiles)
  }
  )
})

// Database CRUD Operations
// Delete a profile based on _id
// DELETE
router.delete("/profiles/:profileId", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  Profile_Model.deleteOne({ _id: req.params.profileId }, (err) => {
    if (err)
      res.status(400).json(`Error: ${err}`)
    else
      res.status(200).send("Deleted one profile successfully!")
  })
})

// Database CRUD Operations
// Modify a profile based on _id
// PATCH
router.patch("/profiles/:profileId", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  Profile_Model.updateOne({ _id: req.params.profileId },
    {
      $set: req.body
    },
    (err) => {
      if (err)
        res.status(400).json(`Error: ${err}`)
      else
        res.status(200).send("Patched one profile")
    })
})

// Database CRUD Operations
// Get a profile based on _id
// GET
router.get("/getProfile/:profileId", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  Profile_Model.findById({ _id: req.params.profileId }, (err, profile) => {
    if (err)
      res.status(400).json(`Error: ${err}`)
    else
      res.status(200).send(profile)
  })
})

// Database CRUD Operations
// Post a new agreement 
// POST
router.post("/agreements", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  console.log(req.body)

  // Check if a landlord profile already exists
  Profile_Model.findOne({ landlordName: req.body.landlord.landlordName }, (err, existingProfile) => {
    if (err)
      res.status(500).send(err)

    else if (existingProfile) {
      const newAgreement = new Agreement_Model({
        ...req.body,
        isSigned: 0,
        profileId: existingProfile._id,
        userId: req.body.userId
      });

      newAgreement.save((agreementErr, savedAgreement) => {
        if (agreementErr) {
          console.log(agreementErr)
          res.status(400).json(`Agreement Error: ${agreementErr}`)
        }
        else {
          res.status(200).send(savedAgreement._id)

        }
      })
    }

    else {
      console.log(req.body.landlord)

      const newProfile = new Profile_Model({
        title: req.body.landlord.landlordName,
        landlordName: req.body.landlord.landlordName,
        city: req.body.landlord.city,
        state: req.body.landlord.state,
        pincode: req.body.landlord.pincode,
        address1: req.body.landlord.address1,
        address2: req.body.landlord.address2,
        createdOn: new Date(),
        userId: req.body.userId
      });

      newProfile.save((profileError, savedProfile) => {
        if (profileError)
          res.status(400).json(`Profile Error: ${profileError}`)

        else {
          const newAgreement = new Agreement_Model({
            ...req.body,
            isSigned: 0,
            profileId: savedProfile._id,
            userId: req.body.userId
          });

          newAgreement.save((agreementErr, savedAgreement) => {
            if (agreementErr) {
              console.log(agreementErr)
              res.status(400).json(`Error: ${agreementErr}`)
            }
            else {
              res.status(200).send(savedAgreement._id)
            }
          })
        }
      })
    }

  })
})

router.patch("/landlord_sign_agreement/:agreementID", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  // console.log(req.body)

  Agreement_Model.updateOne({ _id: req.params.agreementID },
    {
      $set: req.body,
      isSigned: 1
    },
    (err) => {
      if (err)
        res.status(400).json(`Error: ${err}`)
      else
        res.status(200).send("Patched one agreement")
    })
})

router.patch("/tenant_sign_agreement/:agreementID", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  // console.log(req.body)

  Agreement_Model.updateOne({ _id: req.params.agreementID },
    {
      $set: req.body,
      isSigned: 2
    },
    (err) => {
      if (err)
        res.status(400).json(`Error: ${err}`)
      else
        res.status(200).send("Patched one agreement")
    })
})

// Database CRUD Operations
// Get all the agreements corresponding to a user_id
// GET
router.get("/agreements_for_profile/:userId/:profileId", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  Agreement_Model.find({ ...req.params }, (err, agreements) => {
    if (err)
      res.status(400).json(`Error: ${err}`)
    else
      res.status(200).json(agreements)
  }
  )
})

// Database CRUD Operations
// Get all the shared agreements
// GET
router.get("/shared_agreements/:tenantEmail", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  console.log("request received")

  Agreement_Model.find({ ...req.params }, (err, agreements) => {
    if (err)
      res.status(400).json(`Error: ${err}`)
    else
      res.status(200).json(agreements)
  }
  )
})

// Database CRUD Operations
// Get all the agreements corresponding to a user_id
// GET
router.get("/agreements/:userId", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  console.log("request received")

  Agreement_Model.find({ userId: req.params.userId }, (err, agreements) => {
    if (err)
      res.status(400).json(`Error: ${err}`)
    else
      res.status(200).json(agreements)
  }
  )
})

// Database CRUD Operations
// Get an agreement corresponding to it's _id
// GET
router.get("/single_agreement/:agreementID", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  Agreement_Model.findById({ _id: req.params.agreementID }, (err, agreement) => {
    if (err)
      res.status(400).json(`Error: ${err}`)
    else
      res.status(200).json(agreement)
  }
  )
})

// Database CRUD Operations
// Delete an agreement based on _id
// DELETE
router.delete("/agreements/:agreement_id", async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  Agreement_Model.deleteOne({ _id: req.params.agreement_id }, (err) => {
    if (err)
      res.status(400).json(`Error: ${err}`)
    else
      res.status(200).send("Deleted one agreement successfully!")
  })
})

module.exports = router;
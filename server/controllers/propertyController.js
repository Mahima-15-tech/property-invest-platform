    const Property = require("../models/property");

    exports.createProperty = async (req, res) => {

      console.log("👉 BODY:", req.body);
      console.log("👉 FILES:", req.files);
      console.log("👉 USER:", req.user);
    
      try {
        const {
          name,
          type,
          size,
          description,
          city,
          state,
          address,
          street,
          landmark,
          pincode,
          lat,
          lng,
          amenities,
          highlights,
          totalValue,
          totalShares,
          pricePerShare,
          expectedROI,
          targetROI,
          rentalYield,
          appreciation,
          duration,
          tenants,
          propertyGrade,
          
          
        } = req.body;

        const imageFiles = req.files?.images || [];
    const documentFiles = req.files?.documents || [];
    const videoFiles = req.files?.video || [];
    const brochureFiles = req.files?.brochure || [];

    const imageUrls = imageFiles.map(file => file.path);

    const documentUrls = documentFiles.map(file => ({
      name: file.originalname,
      url: file.path,
    }));

    const videoUrl = videoFiles[0]?.path || "";
    const brochureUrl = brochureFiles[0]?.path || "";
      
      console.log("👉 IMAGE URLS:", imageUrls);


      const parsedHighlights = highlights ? JSON.parse(highlights) : [];


const totalSharesNum = Number(totalShares) || 0;


const availableShares = totalSharesNum;


const soldShares = 0;


const soldPercent = 0;


let status = "funding"; 

if (soldPercent >= 100) {
  status = "funded";
}

      
      const property = await Property.create({
        name,
        type,
        size,
        description,
      
        location: {
          city: city ? city.trim().toLowerCase() : "",
          state: state ? state.trim().toLowerCase() : "",
          address: address || "",
          street: street || "",
          landmark: landmark || "",
          pincode: pincode || "",
          lat: lat || 0,
          lng: lng || 0,
        },
      
        totalValue: Number(totalValue) || 0,
        totalShares: totalSharesNum,
        availableShares: availableShares,
        soldShares: soldShares,        
        soldPercent: soldPercent,      
        status: status,                
    pricePerShare: Number(pricePerShare) || 0,

    roi: Number(expectedROI) || 0,
    targetROI: Number(targetROI) || 0,
    rentalYield: Number(rentalYield) || 0,
    appreciation: Number(appreciation) || 0,

    duration: Number(duration) || 0,

    amenities: amenities ? JSON.parse(amenities) : [],
    highlights: parsedHighlights,

    tenants: tenants || "",
    propertyGrade: propertyGrade || "",
    
      
    media: {
      images: imageUrls,
      documents: documentUrls,
      video: videoUrl,
      brochure: brochureUrl,
    },
    isPublished: true  ,
        createdBy: req.user.id,
        
      });

        res.json({
          message: "Property created successfully",
          property,
        });

      

      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
    //broker

    exports.getMyProperties = async (req, res) => {
        const properties = await Property.find({
          createdBy: req.user.id,
        });
      
        res.json(properties);
      };

    
    //   user
    exports.getPropertyById = async (req, res) => {
      try {
        const p = await Property.findById(req.params.id);

        if (!p || !p.isPublished) {
          return res.status(404).json({ message: "Property not found" });
        }

        res.json({
          id: p._id,
          name: p.name,
          category: p.category,
          type: p.type, 

          images: p.media?.images || [],
  video: p.media?.video,
  brochure: p.media?.brochure || "",   // ✅ ADD THIS

          location: p.location,

          totalValue: p.totalValue,
          totalShares: p.totalShares,
          sharePrice: p.pricePerShare,
          roi: p.roi,
          targetROI: p.targetROI,

          fundedPercent: Number((p.soldPercent || 0).toFixed(2)),
          sharesLeft: p.availableShares,
          investors: p.investors,

          rentalYield: p.rentalYield,
          appreciation: p.appreciation,
          duration: p.duration,

          description: p.description,
          size: p.size,
          highlights: p.highlights,

          amenities: p.amenities,

          documents: p.media?.documents || [],

    

      

    tenants: p.tenants,
    propertyGrade: p.propertyGrade,

          calculator: {
            pricePerShare: p.pricePerShare,
            roi: p.roi
          }
        });


        console.log({
          property: p.name,
          soldShares: p.soldShares,
          availableShares: p.availableShares,
          totalShares: p.totalShares,
          soldPercent: p.soldPercent,
        });

      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };


    exports.getRelatedProperties = async (req, res) => {
      try {
        const current = await Property.findById(req.params.id);

        if (!current) {
          return res.status(404).json({ message: "Property not found" });
        }

        let properties = await Property.find({
          _id: { $ne: req.params.id },
          type: current.type,
          isPublished: true
        }).limit(3);

        // 👉 fallback (agar same type na mile)
        if (properties.length === 0) {
          properties = await Property.find({
            _id: { $ne: req.params.id },
            isPublished: true
          }).limit(3);
        }

        res.json(properties);

      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

    exports.getAllProperties = async (req, res) => {
      try {
        const properties = await Property.find({ isPublished: true })
          .sort({ createdAt: -1 }); // 🔥 newest first

        res.json(properties);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
    exports.updateProperty = async (req, res) => {
      try {
        const property = await Property.findById(req.params.id);
    
        if (!property) {
          return res.status(404).json({ message: "Property not found" });
        }
    
        // Nayi uploaded files
        const imageFiles = req.files?.images || [];
        const newUploadedUrls = imageFiles.map((file) => file.path);
    
        // Front-end se bachi hui existing images ka array
        let existingImages = req.body.existingImages || [];
        
        // Agar single string aati h (1 image bacchi ho toh array banao)
        if (typeof existingImages === "string") {
          existingImages = [existingImages];
        }
    
        // Merge: Existing kept images + Newly uploaded images
        const updatedImages = [...existingImages, ...newUploadedUrls];
    
        // Property Fields update
        property.name = req.body.name ?? property.name;
        property.type = req.body.type ?? property.type;
        property.size = req.body.size ?? property.size;
        property.description = req.body.description ?? property.description;
    
        property.location = {
          city: req.body.city ?? property.location?.city,
          state: req.body.state ?? property.location?.state,
          address: req.body.address ?? property.location?.address,
        };
    
        property.totalValue = req.body.totalValue ?? property.totalValue;
        property.totalShares = req.body.totalShares ?? property.totalShares;
        property.roi = req.body.expectedROI ?? property.roi;
        property.duration = req.body.duration ?? property.duration;
    
        if (typeof req.body.isFeatured !== "undefined") {
          property.isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true;
        }
    
        property.media.images = updatedImages;
    
        await property.save();
    
        res.status(200).json({ message: "Property updated successfully", property });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    };
      exports.getPropertiesList = async (req, res) => {
        const properties = await Property.find().select("_id name");
        res.json(properties);
      };

      exports.getFeaturedProperties = async (req, res) => {
        try {
          const properties = await Property.find({
            isFeatured: true,
            isPublished: true,
          })
            .sort({ createdAt: -1 })
            .limit(3);
      
          res.json(properties);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      };


      exports.exploreProperties = async (req, res) => {
        try {
          const {
            search,
            city,
            type,
            minROI,
            maxROI,
            minPrice,
            maxPrice,
            status,
            sort = "newest",
            page = 1,
            limit = 6,
          } = req.query;
      
          let query = {
            isPublished: true,
          };
      
          query.$and = [];
      
          // ===========================
          // SEARCH
          // ===========================
          if (search) {
            query.$and.push({
              $or: [
                {
                  name: {
                    $regex: search,
                    $options: "i",
                  },
                },
                {
                  "location.city": {
                    $regex: search,
                    $options: "i",
                  },
                },
                {
                  type: {
                    $regex: search,
                    $options: "i",
                  },
                },
              ],
            });
          }
      
          // ===========================
          // CITY
          // ===========================
          if (city) {
            const cities = Array.isArray(city) ? city : [city];
      
            query.$and.push({
              "location.city": {
                $in: cities.map((c) => new RegExp(`^${c.trim()}$`, "i")),
              },
            });
          }
      
          // ===========================
          // PROPERTY TYPE
          // ===========================
          if (type) {
            query.type = type;
          }
      
          // ===========================
          // ROI
          // ===========================
          if (minROI || maxROI) {
            query.roi = {};
      
            if (minROI) {
              query.roi.$gte = Number(minROI);
            }
      
            if (maxROI) {
              query.roi.$lte = Number(maxROI);
            }
          }
      
          // ===========================
          // PRICE
          // ===========================
          if (minPrice || maxPrice) {
            query.totalValue = {};
      
            if (minPrice) {
              query.totalValue.$gte = Number(minPrice);
            }
      
            if (maxPrice) {
              query.totalValue.$lte = Number(maxPrice);
            }
          }
      
          // ===========================
          // STATUS
          // ===========================
          if (status) {
            query.status = status;
          }
      
          // remove empty $and
          if (query.$and.length === 0) {
            delete query.$and;
          }
      
          // ===========================
          // SORT
          // ===========================
          let sortOption = {
            createdAt: -1,
          };
      
          if (sort === "roi") {
            sortOption = {
              roi: -1,
            };
          }
      
          if (sort === "price") {
            sortOption = {
              pricePerShare: 1,
            };
          }
      
          if (sort === "funded") {
            sortOption = {
              soldPercent: -1,
            };
          }
      
          // ===========================
          // PAGINATION
          // ===========================
          const skip = (Number(page) - 1) * Number(limit);
      
          console.log("Query =>", query);

const properties = await Property.find(query)
  .sort(sortOption)
  .skip(skip)
  .limit(Number(limit));

console.log("Found =>", properties.length);

console.log(
  properties.map((p) => ({
    name: p.name,
    published: p.isPublished,
  }))
);
      
          const total = await Property.countDocuments(query);
      
          const formatted = properties.map((p) => ({
            id: p._id,
            name: p.name,
            location: p.location,
            city: p.location?.city,
            image: p.media?.images?.[0] || "",
            roi: p.roi,
            totalValue: p.totalValue,
            sharePrice: p.pricePerShare,
            totalShares: p.totalShares,
            availableShares: p.availableShares,
            fundedPercent: Number((p.soldPercent || 0).toFixed(2)),
            soldShares: p.soldShares,
            soldPercent: p.soldPercent,
            type: p.type,
            status: p.status,
            locking_period: p.duration,
          }));
      
          res.json({
            data: formatted,
            pagination: {
              total,
              page: Number(page),
              pages: Math.ceil(total / limit),
            },
          });
        } catch (error) {
          console.log(error);
      
          res.status(500).json({
            error: error.message,
          });
        }
      };

      exports.deleteProperty = async (req, res) => {
        try {
          const property = await Property.findById(req.params.id);
      
          if (!property) {
            return res.status(404).json({ message: "Property not found" });
          }
      
          await property.deleteOne();
      
          res.json({
            message: "Property deleted successfully",
          });
      
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      };


      exports.toggleFeatured = async (req, res) => {
        try {
          const { id } = req.params;
          const { isFeatured } = req.body;
      
          const property = await Property.findById(id);
      
          if (!property) {
            return res.status(404).json({
              message: "Property not found",
            });
          }
      
          // Maximum 3 featured properties
          if (isFeatured) {
            const count = await Property.countDocuments({
              isFeatured: true,
            });
      
            if (count >= 3) {
              return res.status(400).json({
                message: "Maximum 3 featured properties allowed.",
              });
            }
          }
      
          property.isFeatured = isFeatured;
          
      
          await property.save();
      
          res.json({
            message: "Featured updated successfully",
            property,
          });
      
        } catch (err) {
          res.status(500).json({
            error: err.message,
          });
        }
      };

      exports.getNearbyProperties = async (req, res) => {
        try {
          const { lat, lng, radius = 10 } = req.query;
      
          // Validation
          if (!lat || !lng) {
            return res.status(400).json({
              success: false,
              message: "Latitude and longitude are required",
            });
          }
      
          const userLat = Number(lat);
          const userLng = Number(lng);
          const radiusInKm = Number(radius);
      
          if (isNaN(userLat) || isNaN(userLng)) {
            return res.status(400).json({
              success: false,
              message: "Invalid latitude or longitude",
            });
          }
      
          // Get published properties having location
          const properties = await Property.find({
            isPublished: true,
            "location.lat": { $ne: null },
            "location.lng": { $ne: null },
          });
      
          // Distance calculation
          const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Earth radius in KM
      
            const dLat = ((lat2 - lat1) * Math.PI) / 180;
            const dLon = ((lon2 - lon1) * Math.PI) / 180;
      
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
      
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
            return R * c;
          };
      
          // Filter nearby properties
          const nearbyProperties = properties
            .map((property) => {
              const distance = calculateDistance(
                userLat,
                userLng,
                Number(property.location.lat),
                Number(property.location.lng)
              );
      
              return {
                id: property._id,
                name: property.name,
                type: property.type,
      
                location: property.location,
      
                image: property.media?.images?.[0] || "",
      
                roi: property.roi,
                totalValue: property.totalValue,
                sharePrice: property.pricePerShare,
      
                fundedPercent: Number(
                  (property.soldPercent || 0).toFixed(2)
                ),
      
                status: property.status,
      
                distance: Number(distance.toFixed(2)),
              };
            })
            .filter((property) => property.distance <= radiusInKm)
            .sort((a, b) => a.distance - b.distance);
      
          return res.status(200).json({
            success: true,
            userLocation: {
              lat: userLat,
              lng: userLng,
            },
            radius: `${radiusInKm} km`,
            total: nearbyProperties.length,
            data: nearbyProperties,
          });
      
        } catch (error) {
          console.error("Nearby property error:", error);
      
          return res.status(500).json({
            success: false,
            message: "Failed to fetch nearby properties",
            error: error.message,
          });
        }
      };
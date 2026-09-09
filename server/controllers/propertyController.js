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
    
          // NEW SHARE SETTINGS
          shareBuyingCycle,
          enableFullOwnership,
        } = req.body;
    
        // ================= FILES =================
    
        const imageFiles = req.files?.images || [];
        const documentFiles = req.files?.documents || [];
        const videoFiles = req.files?.video || [];
        const brochureFiles = req.files?.brochure || [];
    
        const imageUrls = imageFiles.map((file) => file.path);
    
        const documentUrls = documentFiles.map((file) => ({
          name: file.originalname,
          url: file.path,
        }));
    
        const videoUrl = videoFiles[0]?.path || "";
        const brochureUrl = brochureFiles[0]?.path || "";
    
        console.log("👉 IMAGE URLS:", imageUrls);
    
        const parsedHighlights = highlights ? JSON.parse(highlights) : [];
    
        // ================= SHARE CONFIGURATION =================
    
        // Total property shares
        const totalSharesNum = Number(totalShares) || 0;
    
        // Company ke fixed reserved shares
        const companyReservedShares = 10;
    
        // Public investors ke liye shares
        const publicAvailableShares = Math.max(
          totalSharesNum - companyReservedShares,
          0
        );

        // ==========================================
// VALIDATE PUBLIC SHARE POOL
// ==========================================

const shareCycle = [5, 10].includes(Number(shareBuyingCycle))
? Number(shareBuyingCycle)
: 10;

if (publicAvailableShares < 10) {
return res.status(400).json({
  message: "Property must have at least 10 public shares available.",
});
}

if (shareCycle === 10 && publicAvailableShares % 10 !== 0) {
return res.status(400).json({
  message:
    "For 10-share cycle, public available shares must be a multiple of 10.",
});
}

if (shareCycle === 5 && publicAvailableShares % 5 !== 0) {
return res.status(400).json({
  message:
    "For 5-share cycle, public available shares must be in multiples of 5.",
});
}
    
        // Initially koi public share sold nahi hua
        const soldShares = 0;
    
        // Initially public shares available hain
        const availableShares = publicAvailableShares;
    
        // Fixed business rule
        // 10 shares = 1 stakeholder
        const stakeholderUnit = 10;
    
       
    
        // Fixed lock-in period
        const lockInYears = 2;
    
        // Initially 0% shares sold
        const soldPercent = 0;
    
        // Property funding status
        let status = "funding";
    
        // ================= CREATE PROPERTY =================
    
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
            lat: Number(lat) || 0,
            lng: Number(lng) || 0,
          },
        
          totalValue: Number(totalValue) || 0,
        
          totalShares: totalSharesNum,
        
          companyReservedShares: companyReservedShares,
        
          publicAvailableShares: publicAvailableShares,
        
          shareBuyingCycle: shareCycle,
        
          stakeholderUnit: stakeholderUnit,
        
          lockInYears: lockInYears,
        
          enableFullOwnership:
            enableFullOwnership === "true" ||
            enableFullOwnership === true,
        
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
        
          isPublished: true,
        
          createdBy: req.user.id,
        });
        
        res.json({
          message: "Property created successfully",
          property,
        });

 
      } catch (error) {
        console.error("❌ CREATE PROPERTY ERROR FULL:", error);
      
        console.error("❌ ERROR MESSAGE:", error?.message);
      
        console.error("❌ ERROR STACK:", error?.stack);
      
        res.status(500).json({
          success: false,
          message: error?.message || "Property creation failed",
          error,
        });
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
    
        if (!p) {
          return res.status(404).json({
            message: "Property not found",
          });
        }
    
        res.json({
          _id: p._id,
    
          // ================= BASIC =================
    
          name: p.name || "",
          category: p.category || "",
          type: p.type || "",
          size: p.size || "",
          description: p.description || "",
    
          // ================= LOCATION =================
    
          location: {
            city: p.location?.city || "",
            state: p.location?.state || "",
            address: p.location?.address || "",
            street: p.location?.street || "",
            landmark: p.location?.landmark || "",
            pincode: p.location?.pincode || "",
            lat: p.location?.lat || "",
            lng: p.location?.lng || "",
          },
    
          // ================= PROPERTY VALUE =================
    
          totalValue: p.totalValue || 0,
          totalShares: p.totalShares || 0,
    
          companyReservedShares:
            p.companyReservedShares ?? 10,
    
          publicAvailableShares:
            p.publicAvailableShares ?? 0,
    
          availableShares:
            p.availableShares ?? 0,
    
          soldShares:
            p.soldShares ?? 0,
    
          soldPercent:
            p.soldPercent ?? 0,
    
          pricePerShare:
            p.pricePerShare || 0,
    
          // ================= RETURNS =================
    
          roi: p.roi || 0,
    
          targetROI:
            p.targetROI || 0,
    
          rentalYield:
            p.rentalYield || 0,
    
          appreciation:
            p.appreciation || 0,
    
          duration:
            p.duration || 0,
    
          // ================= SHARE SETTINGS =================
    
          shareBuyingCycle:
            p.shareBuyingCycle || 10,
    
          stakeholderUnit:
            p.stakeholderUnit || 10,
    
          lockInYears:
            p.lockInYears ?? 2,
    
          enableFullOwnership:
            p.enableFullOwnership ?? false,
    
          // ================= DETAILS =================
    
          amenities:
            p.amenities || [],
    
          highlights:
            p.highlights || [],
    
          tenants:
            p.tenants || "",
    
          propertyGrade:
            p.propertyGrade || "",
    
          // ================= STATUS =================
    
          


            status: p.status || "funding",

isFeatured: p.isFeatured || false,

isPublished: p.isPublished ?? true,

pricePerShare: p.pricePerShare || 0,
    
          // ================= MEDIA =================
    
          media: {
            images:
              p.media?.images || [],
    
            documents:
              p.media?.documents || [],
    
            video:
              p.media?.video || "",
    
            brochure:
              p.media?.brochure || "",
          },
    
          createdAt: p.createdAt,
        });
    
      } catch (error) {
        console.error(
          "GET PROPERTY BY ID ERROR:",
          error
        );
    
        res.status(500).json({
          error: error.message,
        });
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
        const properties = await Property.find({ isPublished: true, isDeleted: { $ne: true } })
          .sort({ createdAt: -1 }); // 🔥 newest first

        res.json(properties);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

    exports.updateProperty = async (req, res) => {
      try {
        const property = await Property.findById(
          req.params.id
        );
    
        if (!property) {
          return res.status(404).json({
            success: false,
            message: "Property not found",
          });
        }
    
        console.log(
          "UPDATE PROPERTY BODY:",
          req.body
        );
    
        console.log(
          "UPDATE PROPERTY FILES:",
          req.files
        );
    
        // ==========================================
        // FILES
        // ==========================================
    
        const imageFiles =
          req.files?.images || [];
    
        const documentFiles =
          req.files?.documents || [];
    
        const videoFiles =
          req.files?.video || [];
    
        const brochureFiles =
          req.files?.brochure || [];
    
    
        // ==========================================
        // NEW IMAGE URLS
        // ==========================================
    
        const newImageUrls =
          imageFiles.map(
            (file) => file.path
          );
    
    
        // ==========================================
        // EXISTING IMAGES
        // ==========================================
    
     // ==========================================
// EXISTING IMAGES
// ==========================================

let existingImages = [];

const rawExistingImages = req.body.existingImages;

if (rawExistingImages) {
  try {
    let parsedImages = rawExistingImages;

    // JSON string ko parse karo
    if (typeof parsedImages === "string") {
      parsedImages = JSON.parse(parsedImages);
    }

    // Array ensure karo
    if (!Array.isArray(parsedImages)) {
      parsedImages = [parsedImages];
    }

    // Har image ko normalize karo
    existingImages = parsedImages
      .map((img) => {
        if (!img) return null;

        // Object case
        if (typeof img === "object") {
          return (
            img.url ||
            img.path ||
            img.secure_url ||
            img.imageUrl ||
            null
          );
        }

        // String case
        if (typeof img === "string") {
          return img;
        }

        return null;
      })
      .filter(Boolean);

  } catch (error) {
    console.error(
      "EXISTING IMAGES PARSE ERROR:",
      error.message
    );

    existingImages = [];
  }
}


// ==========================================
// FINAL IMAGES
// ==========================================

property.media.images = [
  ...existingImages,
  ...newImageUrls,
];
    
    
        // ==========================================
        // EXISTING DOCUMENTS
        // ==========================================
    
        let existingDocuments = [];
    
        if (req.body.existingDocuments) {
          try {
            existingDocuments =
              JSON.parse(
                req.body.existingDocuments
              );
          } catch (error) {
            existingDocuments =
              property.media?.documents || [];
          }
        } else {
          existingDocuments =
            property.media?.documents || [];
        }
    
    
        // ==========================================
        // NEW DOCUMENTS
        // ==========================================
    
        const newDocuments =
          documentFiles.map((file) => ({
            name:
              file.originalname,
    
            url:
              file.path,
          }));
    
    
        property.media.documents = [
          ...existingDocuments,
          ...newDocuments,
        ];
    
    
        // ==========================================
        // VIDEO
        // ==========================================
    
        if (videoFiles.length > 0) {
          property.media.video =
            videoFiles[0].path;
        }
    
        if (
          req.body.removeVideo === "true"
        ) {
          property.media.video = "";
        }
    
    
        // ==========================================
        // BROCHURE
        // ==========================================
    
        if (brochureFiles.length > 0) {
          property.media.brochure =
            brochureFiles[0].path;
        }
    
        if (
          req.body.removeBrochure === "true"
        ) {
          property.media.brochure = "";
        }
    
    
        // ==========================================
        // BASIC INFORMATION
        // ==========================================
    
        property.name =
          req.body.name ??
          property.name;
    
        property.type =
          req.body.type ??
          property.type;
    
        property.size =
          req.body.size ??
          property.size;
    
        property.description =
          req.body.description ??
          property.description;
    
    
        // ==========================================
        // LOCATION
        // ==========================================
    
        property.location = {
          city:
            req.body.city !== undefined
              ? req.body.city
                  .trim()
                  .toLowerCase()
              : property.location?.city || "",
    
          state:
            req.body.state !== undefined
              ? req.body.state
                  .trim()
                  .toLowerCase()
              : property.location?.state || "",
    
          address:
            req.body.address ??
            property.location?.address ??
            "",
    
          street:
            req.body.street ??
            property.location?.street ??
            "",
    
          landmark:
            req.body.landmark ??
            property.location?.landmark ??
            "",
    
          pincode:
            req.body.pincode ??
            property.location?.pincode ??
            "",
    
          lat:
            req.body.lat !== undefined
              ? Number(req.body.lat)
              : property.location?.lat || 0,
    
          lng:
            req.body.lng !== undefined
              ? Number(req.body.lng)
              : property.location?.lng || 0,
        };
    
    
        // ==========================================
        // INVESTMENT VALUES
        // ==========================================
    
        if (
          req.body.totalValue !== undefined
        ) {
          property.totalValue =
            Number(req.body.totalValue) || 0;
        }
    
    
        // ==========================================
        // SHARE SETTINGS
        // ==========================================
    
        if (
          req.body.totalShares !== undefined
        ) {
    
          const totalShares =
            Number(req.body.totalShares);
    
          const companyReservedShares =
            property.companyReservedShares ?? 10;
    
          const soldShares =
            property.soldShares ?? 0;
    
          if (
            totalShares <
            companyReservedShares + soldShares
          ) {
            return res.status(400).json({
              message:
                `Total shares cannot be less than reserved shares (${companyReservedShares}) + already sold shares (${soldShares}).`,
            });
          }
    
          const publicAvailableShares =
            totalShares -
            companyReservedShares;
    
          const shareBuyingCycle =
            [5, 10].includes(
              Number(req.body.shareBuyingCycle)
            )
              ? Number(
                  req.body.shareBuyingCycle
                )
              : property.shareBuyingCycle || 10;
    
    
          if (
            publicAvailableShares < 10
          ) {
            return res.status(400).json({
              message:
                "Property must have at least 10 public shares available.",
            });
          }
    
    
          if (
            shareBuyingCycle === 10 &&
            publicAvailableShares % 10 !== 0
          ) {
            return res.status(400).json({
              message:
                "For 10-share cycle, public shares must be a multiple of 10.",
            });
          }
    
    
          if (
            shareBuyingCycle === 5 &&
            publicAvailableShares % 5 !== 0
          ) {
            return res.status(400).json({
              message:
                "For 5-share cycle, public shares must be a multiple of 5.",
            });
          }
    
    
          property.totalShares =
            totalShares;
    
          property.publicAvailableShares =
            publicAvailableShares;
    
          // Already sold shares ko touch nahi karenge
          property.availableShares =
            Math.max(
              publicAvailableShares -
                soldShares,
              0
            );
    
          property.shareBuyingCycle =
            shareBuyingCycle;
    
          property.soldPercent =
            publicAvailableShares > 0
              ? Number(
                  (
                    (soldShares /
                      publicAvailableShares) *
                    100
                  ).toFixed(2)
                )
              : 0;
        }
    
    
        // ==========================================
        // SHARE BUYING CYCLE ONLY UPDATE
        // ==========================================
    
        if (
          req.body.shareBuyingCycle !== undefined
        ) {
    
          const cycle =
            Number(
              req.body.shareBuyingCycle
            );
    
          if (![5, 10].includes(cycle)) {
            return res.status(400).json({
              message:
                "Share buying cycle must be 5 or 10.",
            });
          }
    
          property.shareBuyingCycle =
            cycle;
        }
    
    
        // ==========================================
        // PRICE PER SHARE
        // ==========================================
    
        if (
          req.body.pricePerShare !== undefined &&
          req.body.pricePerShare !== ""
        ) {
    
          property.pricePerShare =
            Number(
              req.body.pricePerShare
            ) || 0;
    
        } else if (
          property.totalValue &&
          property.totalShares
        ) {
    
          property.pricePerShare =
            Number(
              (
                property.totalValue /
                property.totalShares
              ).toFixed(2)
            );
        }
    
    
        // ==========================================
        // RETURNS
        // ==========================================
    
        if (
          req.body.expectedROI !== undefined
        ) {
          property.roi =
            Number(
              req.body.expectedROI
            ) || 0;
        }
    
    
        if (
          req.body.targetROI !== undefined
        ) {
          property.targetROI =
            Number(
              req.body.targetROI
            ) || 0;
        }
    
    
        if (
          req.body.rentalYield !== undefined
        ) {
          property.rentalYield =
            Number(
              req.body.rentalYield
            ) || 0;
        }
    
    
        if (
          req.body.appreciation !== undefined
        ) {
          property.appreciation =
            Number(
              req.body.appreciation
            ) || 0;
        }
    
    
        if (
          req.body.duration !== undefined
        ) {
          property.duration =
            Number(
              req.body.duration
            ) || 0;
        }
    
    
        // ==========================================
        // FULL OWNERSHIP
        // ==========================================
    
        if (
          req.body.enableFullOwnership !==
          undefined
        ) {
    
          property.enableFullOwnership =
            req.body.enableFullOwnership ===
              "true" ||
            req.body.enableFullOwnership ===
              true;
        }
    
    
        // ==========================================
        // AMENITIES
        // ==========================================
    
        if (
          req.body.amenities !== undefined
        ) {
    
          try {
            property.amenities =
              JSON.parse(
                req.body.amenities
              );
          } catch (error) {
            property.amenities =
              property.amenities || [];
          }
        }
    
    
        // ==========================================
        // HIGHLIGHTS
        // ==========================================
    
        if (
          req.body.highlights !== undefined
        ) {
    
          try {
            property.highlights =
              JSON.parse(
                req.body.highlights
              );
          } catch (error) {
            property.highlights =
              property.highlights || [];
          }
        }
    
    
        // ==========================================
        // TENANTS
        // ==========================================
    
        if (
          req.body.tenants !== undefined
        ) {
    
          property.tenants =
            req.body.tenants;
        }
    
    
        // ==========================================
        // PROPERTY GRADE
        // ==========================================
    
        if (
          req.body.propertyGrade !== undefined
        ) {
    
          property.propertyGrade =
            req.body.propertyGrade;
        }
    
    
        // ==========================================
        // FEATURED
        // ==========================================
    
        if (
          req.body.isFeatured !== undefined
        ) {
    
          property.isFeatured =
            req.body.isFeatured === "true" ||
            req.body.isFeatured === true;
        }
    
    
        // ==========================================
        // STATUS
        // ==========================================
    
        if (
          req.body.status !== undefined
        ) {
    
          property.status =
            req.body.status;
        }
    
    
        // ==========================================
        // PUBLISHED
        // ==========================================
    
        if (
          req.body.isPublished !== undefined
        ) {
    
          property.isPublished =
            req.body.isPublished === "true" ||
            req.body.isPublished === true;
        }
    
    
        // ==========================================
        // SAVE
        // ==========================================
    
        await property.save();
    
    
        return res.status(200).json({
          success: true,
    
          message:
            "Property updated successfully",
    
          property,
        });
    
      } catch (err) {
    
        console.error(
          "UPDATE PROPERTY ERROR:",
          err
        );
    
        return res.status(500).json({
          success: false,
    
          error:
            err.message ||
            "Failed to update property",
        });
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
            .limit(6);
      
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
            soldShares: p.soldShares,
            soldPercent: p.soldPercent,
          
            fundedPercent: Number((p.soldPercent || 0).toFixed(2)),
          
            type: p.type,
            status: p.status,
          
            // ================= SHARE SETTINGS =================
          
            // Backend se actual lock-in period
            lockInYears: p.lockInYears ?? 2,
          
            // Property ka buying cycle
            shareBuyingCycle: p.shareBuyingCycle ?? 10,
          
            // Fixed stakeholder rule
            stakeholderUnit: p.stakeholderUnit ?? 10,
          
            // Company reserved shares
            companyReservedShares: p.companyReservedShares ?? 10,
          
            // Public investor shares
            publicAvailableShares: p.publicAvailableShares ?? 0,
          
            // 100% ownership allowed or not
            enableFullOwnership: p.enableFullOwnership ?? false,
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
            return res.status(404).json({
              success: false,
              message: "Property not found",
            });
          }
      
          if (property.isDeleted) {
            return res.status(400).json({
              success: false,
              message: "Property is already deleted",
            });
          }
      
          property.isDeleted = true;
          property.deletedAt = new Date();
      
          // Deleted property should no longer appear publicly
          property.isPublished = false;
          property.isFeatured = false;
      
          await property.save();
      
          return res.json({
            success: true,
            message: "Property moved to deleted properties",
            property,
          });
        } catch (error) {
          console.error("DELETE PROPERTY ERROR:", error);
      
          return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete property",
          });
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
      
            if (count >= 6) {
              return res.status(400).json({
                message: "Maximum 6 featured properties allowed.",
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


      // =====================================================
// GET DELETED PROPERTIES
// =====================================================

exports.getDeletedProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      isDeleted: true,
    })
      .sort({ deletedAt: -1 })
      .populate("createdBy", "name email");

    return res.json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error(
      "GET DELETED PROPERTIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch deleted properties",
    });
  }
};

// =====================================================
// RESTORE DELETED PROPERTY
// =====================================================

exports.restoreProperty = async (req, res) => {
  try {
    const property = await Property.findById(
      req.params.id
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (!property.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Property is not deleted",
      });
    }

    property.isDeleted = false;
    property.deletedAt = null;

    // Restore listing visibility
    property.isPublished = true;

    await property.save();

    return res.json({
      success: true,
      message: "Property restored successfully",
      property,
    });
  } catch (error) {
    console.error(
      "RESTORE PROPERTY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to restore property",
    });
  }
};
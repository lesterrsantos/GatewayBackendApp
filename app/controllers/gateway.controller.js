const db = require("../models");
const Gateway = db.gateways;

// Create and Save a new Gateway
exports.create = (req, res) => {
  // Validate request
  if (!req.body.serialNumber) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  if (req.body.peripheralDevices.length > 10) {
    res.status(400).send({
      message: "ERROR: The number of peripheral devices must be less than 10",
    });
    return;
  }

  // Create a gateway
  const gateway = new Gateway({
    serialNumber: req.body.serialNumber,
    humanReadableName: req.body.humanReadableName,
    ipv4Address: req.body.ipv4Address,
    peripheralDevices: req.body.peripheralDevices,
  });

  // Save gateway in the database
  gateway
    .save(gateway)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Gateway.",
      });
    });
};

// Retrieve all Gateways from the database.
exports.findAll = (req, res) => {
  const gatewayName = req.query.name;
  var condition = gatewayName
    ? { humanReadableName: { $regex: new RegExp(gatewayName), $options: "i" } }
    : {};

  Gateway.find(condition)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving gateways.",
      });
    });
};

// Find a single Gateway with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Gateway.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Gateway with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving Gateway with id=" + id });
    });
};

// Update a Gateway by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  if (req.body.peripheralDevices.length > 10) {
    return res.status(400).send({
      message: "ERROR: The number of peripheral devices must be less than 10",
    });
  }

  const id = req.params.id;

  Gateway.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Gateway with id=${id}. Maybe Gateway was not found!`,
        });
      } else res.send({ message: "Gateway was updated successfully.", data });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Gateway with id=" + id,
      });
    });
};

// Delete a Gateway with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Gateway.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Gateway with id=${id}. Maybe Gateway was not found!`,
        });
      } else {
        res.send({
          message: "Gateway was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Gateway with id=" + id,
      });
    });
};

// Delete all Gateways from the database.
exports.deleteAll = (req, res) => {
  Gateway.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Gateways were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all gateways.",
      });
    });
};

//POST - Add a PeripheralDevice to a Gateway
exports.addPeripheralDevice = (req, res) => {
  const id = req.params.id;

  Gateway.findById(id)
    .then((gateway) => {
      if (!gateway) {
        return res
          .status(404)
          .send({ message: "Not found Gateway with id " + id });
      }

      if (gateway.peripheralDevices.length == 10) {
        return res.status(404).send({
          message: "ERROR: Cannot add peripheral device for this gateway",
        });
      }

      var duplicateGateways = gateway.peripheralDevices.filter(
        (device) => device.uid === req.body.peripheralDevice.uid
      );

      if (duplicateGateways.length !== 0) {
        return res.status(404).send({
          message: "ERROR: Peripheral device exist for this gateway",
        });
      }

      gateway.peripheralDevices = gateway.peripheralDevices.concat([
        req.body.peripheralDevice,
      ]);

      // Save gateway in the database
      gateway
        .save(gateway)
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Gateway.",
          });
        });
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving Gateway with id=" + id });
    });
};

//DELETE - a PeripheralDevice from a Gateway
exports.deletePeripheralDevice = (req, res) => {
  const id = req.params.id;

  Gateway.findById(id)
    .then((gateway) => {
      if (!gateway) {
        return res
          .status(404)
          .send({ message: "Not found Gateway with id " + id });
      }

      var filteredGateways = gateway.peripheralDevices.filter(
        (device) => device.uid !== req.body.peripheralDevice.uid
      );

      gateway.peripheralDevices = filteredGateways;

      // Save gateway in the database
      gateway
        .save(gateway)
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Gateway.",
          });
        });
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving Gateway with id=" + id });
    });
};

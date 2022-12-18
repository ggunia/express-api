const express = require('express');
const { Op } = require('sequelize');
const { getProfile } = require('../middleware/getProfile');

const router = express.Router();

router.get('/contracts', getProfile, async(req, res) => {
  const { Contract } = req.app.get('models')
  const { id } = req.profile

  const contracts = await Contract.findAll({
    where: {
      [Op.and]: [
        { status: { [Op.not]: 'terminated' } },
        { [Op.or]: [ { ContractorId: id }, { ClientId: id } ]},
      ]
    }
  })

  return res.json(contracts)
})

router.get('/contracts/:id', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models')
  const { id } = req.params
  const { id: profileId } = req.profile

  const contract = await Contract.findOne({
    where: {
      [Op.and]: [
        { id },
        { [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }] }
      ]
    }
  })

  if(!contract) return res.status(404).json({ message: 'Contract not found' }).end()

  res.json(contract)
})

module.exports = { contractModule: router }

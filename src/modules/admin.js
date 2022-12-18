const express = require('express');
const { Op } = require('sequelize');

const { sequelize } = require('../model');
const { isAdmin } = require('../middleware/isAdmin')

const router = express.Router();

router.get('/admin/best-profession', isAdmin, async(req, res) => {
  const { Contract, Profile, Job } = req.app.get('models')
  const { start, end } = req.query

  if (!start || !end) return res.status(400).json({ message: 'Please provide time range.' })

  const [winner] = await Contract.findAll({
    attributes: ['ContractorId', [sequelize.fn('sum', sequelize.col('Jobs.price')), 'total']],
    include: [{
      model: Job,
      attributes: [],
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [start, end]
        }
      }
    }],
    group: ['Contract.ContractorId'],
    order: sequelize.literal('total DESC'),
    limit: 1,
    subQuery: false
  });

  if (!winner) {
    return res.json({ message: 'No data found' })
  }

  const profile = await Profile.findOne({ id: winner.ContractorId })

  return res.json({ message: `Winner profession is: ${profile.profession}` })
})

router.get('/admin/best-clients', isAdmin, async(req, res) => {
  const { Contract, Profile, Job } = req.app.get('models')
  const { start, end, limit = 2 } = req.query

  if (!start || !end) return res.status(400).json({ message: 'Please provide time range.' })

  const data = await Contract.findAll({
    attributes: [
      'ClientId',
      [sequelize.fn('sum', sequelize.col('Jobs.price')), 'paid']
    ],
    include: [
      {
        model: Job,
        attributes: [],
        where: {
          paid: true,
          paymentDate: {
            [Op.between]: [start, end]
          }
        }
      },
      { model: Profile, attributes: ['firstName', 'lastName'], as: 'Client' }
    ],
    group: ['Contract.ClientId'],
    order: sequelize.literal('paid DESC'),
    limit: limit,
    subQuery: false
  });

  const withFullName = data.map(curr => {
    const row = curr.toJSON()
    return {
        id: row.ClientId,
        paid: row.paid,
        fullName: `${row.Client.firstName} ${row.Client.lastName}`,
    }})

  return res.json(withFullName)
})

module.exports = { adminModule: router }

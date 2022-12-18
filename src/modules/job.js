const express = require('express');
const { Op } = require('sequelize');

const { sequelize } = require('../model')
const { getProfile } = require('../middleware/getProfile');

const router = express.Router();

router.get('/jobs/unpaid', getProfile, async (req, res) => {
  const { Job } = req.app.get('models')
  const { profile } = req

  const contractQuery = { where: { status: 'in_progress' }, attributes: ['id'] }
  const contracts = await Promise
    .all([profile.getClient(contractQuery), profile.getContractor(contractQuery)])
    .then(([clients, contractors]) => clients.concat(contractors))

  const jobs = await Job.findAll({
    where: {
      paid: { [Op.not]: true },
      ContractId: {
        [Op.in]: contracts.map(curr => curr.id)
      }
    }
  })

  return res.json(jobs)
})

router.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
  const { Profile, Job } = req.app.get('models')
  const { job_id } = req.params
  const { profile } = req

  const job = await Job.findOne({ where: { id: job_id } })

  if (job.paid) return res.status(200).json({ message: 'Job has already been paid.' })
  if (job.price > profile.balance) return res.status(400).json({ message: 'You don\'t have enough balance.' })

  const contract = await job.getContract({ attributes: ['ContractorId'] })

  if (!contract) {
    return res.status(404).json({ message: 'Contract not found.' })
  }

  try {
    await sequelize.transaction(async (t) =>
      await Promise.all([
        Profile.increment('balance', { by: -job.price, where: { id: profile.id }, transaction: t }),
        Profile.increment('balance', { by: job.price, where: { id: contract.ContractorId }, transaction: t }),
        Job.update({ paid: true, paymentDate: new Date() }, { where: { id: job_id }, transaction: t })
      ])
    )

    res.status(200).json({
      message: 'Job paid successfully',
      data: {
        currentBalance: profile.balance - job.price,
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = { jobModule: router }

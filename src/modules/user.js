const express = require('express');
const { Op } = require('sequelize');

const { getProfile } = require('../middleware/getProfile');

const router = express.Router();

router.post('/balances/deposit', getProfile, async (req, res) => {
  const { Profile, Job } = req.app.get('models')
  const { amount } = req.body
  const { profile } = req

  if (!amount) return res.status(400).json({ message: 'Please enter amount.' })

  const contracts = await profile.getClient({ attributes: ['id'], where: { status: 'in_progress' } })
  const jobsToPay = await Job.sum('price', {
    where: {
      id: { 
        [Op.in]: contracts.map(curr => curr.id)
      },
    paid: { [Op.not]: true } }
  })

  // maximum allowed balance should not be more than 25% of this total of jobs to pay
  const maxAllowedBalance = jobsToPay + jobsToPay / 4

  if (profile.balance + amount > maxAllowedBalance) {
    const message = profile.balance > maxAllowedBalance
      ? 'You have already have maxed out deposit'
      : `You can deposit max of - ${maxAllowedBalance - profile.balance} USD`

    return res.status(400).json({
      message: `You are not allowed to deposit more than 25% of your total of jobs to pay. ${message}`,
    })
  }

  const updatedProfile = Profile.increment('balance', { by: amount, where: { id: profile.id } })

  return res.status(200).json({
    message: 'Deposit successful',
    data: updatedProfile
  })
})

module.exports = { userModule: router }

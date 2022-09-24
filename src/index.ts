import cors from 'cors'
import express from 'express'
import { config } from '~/config'
import { ExceptionsHandler } from '~/middlewares/exceptions.handler'
import { UnknownRoutesHandler } from '~/middlewares/unknownRoutes.handler'
import { JsomNode } from 'sp-jsom-node'
import { Client } from 'ldapts'
const ntlm = require('express-ntlm')
/**
 * On créé une nouvelle "application" express
 */
const app = express()




/**
 * On dit à Express que l'on souhaite parser le body des requêtes en JSON
 *
 * @example app.post('/', (req) => req.body.prop)
 */
app.use(express.json())

/**
 * On dit à Express que l'on souhaite autoriser tous les noms de domaines
 * à faire des requêtes sur notre API.
 */
app.use(cors())


app.use(ntlm({

  domain: 'agglo.local',
  domaincontroller: 'ldap://agglo.local',


}))

/**
 * Toutes les routes CRUD pour les animaux seronts préfixées par `/pets`
 */
//app.use('/pets', PetsController)
app.post('/ntlm', (req:any,res:any) => {
  const result = JSON.stringify(req.ntlm)
  console.log('Auth :',JSON.parse(result))
  const response = JSON.parse(result)
  res.send(JSON.stringify({ success:'ok'}))
})

/**
 * Homepage (uniquement necessaire pour cette demo)
 */
app.post('/lists', async (req:any, res:any) => {
  const siteUrl = req.body.siteUrl
  const username = req.body.username
  const password = req.body.password

  const domain = req.body.domain

  console.log('Site url :',siteUrl)
  console.log('username :',username)
  console.log('password :',password)
  console.log('domain :',domain)
  const sp2019: JsomNode = new JsomNode({
    modules: ['taxonomy', 'userprofiles'],
  })
  const ctx = sp2019
    .init({
      siteUrl,
      authOptions: {
        username,
        password,
        domain
      }
    })
  const spctx = await ctx.getContext()
  const oListsCollection: SP.ListCollection = spctx.get_web().get_lists()
  spctx.load(oListsCollection, 'Include(Title)')
  try {
    await spctx.executeQueryPromise()
    const arrList:any[] = []
    const listsTitlesArr = oListsCollection.get_data().map(l => {
      arrList.push({ Title:l.get_title() })
    })
    console.log('List test :', arrList)
    console.log('List :', listsTitlesArr)
    res.send(JSON.stringify(arrList))
  } catch(err) {
    res.send(`Error : ${err}`)
  }


})

app.post('/ldap/users', async (req:any, res:any) => {
  const url = req.body.url
  const bindDN = req.body.bindDN
  const secret = req.body.secret

  const baseDN = req.body.baseDN

  console.log('Ldap url :',url)
  console.log('BindDN :',bindDN)
  console.log('Secret :',secret)
  console.log('BaseDN :',baseDN)

  const client = new Client({
    url,
    timeout: 0,
    connectTimeout: 0,
    strictDN: true,
  })
  console.log('Client crée :',client)

  if (client.isConnected) {
    console.log('Client ldap connecté')
  } else {
    console.log('Client ldap Non connecté')
  }
  try {
    await client.bind(bindDN, secret)

    const { searchEntries, searchReferences } = await client.search(baseDN, {
      scope: 'sub',
      filter: '(mail=herve.dechavigny@cacem.fr)',
    })

    console.log('Entries :',searchEntries)
    console.log('References :',searchReferences)
  // eslint-disable-next-line no-useless-catch
  } catch (ex) {
    throw ex
  } finally {
    await client.unbind()
  }
})

/*
 *app.post('/lists/read', async (req:any, res:any) => {
 *
 *})
 */



/**
 * Pour toutes les autres routes non définies, on retourne une erreur
 */
app.all('*', UnknownRoutesHandler)

/**
 * Gestion des erreurs
 * /!\ Cela doit être le dernier `app.use`
 */
app.use(ExceptionsHandler)

/**
 * On demande à Express d'ecouter les requêtes sur le port défini dans la config
 */
app.listen(config.API_PORT, () => console.log('Silence, ça tourne.'))

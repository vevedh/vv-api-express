import cors from 'cors'
import express from 'express'
import { config } from '~/config'
import { PetsController } from '~/resources/pets/pets.controller'
import { ExceptionsHandler } from '~/middlewares/exceptions.handler'
import { UnknownRoutesHandler } from '~/middlewares/unknownRoutes.handler'
import { JsomNode } from "sp-jsom-node"

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

/**
 * Toutes les routes CRUD pour les animaux seronts préfixées par `/pets`
 */
app.use('/pets', PetsController)

/**
 * Homepage (uniquement necessaire pour cette demo)
 */
app.post('/lists', async (req, res) => {
      const siteUrl = req.body.siteUrl
      const username = req.body.username
      const password = req.body.password

      const domain = req.body.domain

      console.log("Site url :",siteUrl)
      console.log("username :",username)
      console.log("password :",password)
      console.log("domain :",domain)
      const sp2019: JsomNode = new JsomNode({
        modules: ["taxonomy", "userprofiles"],
      })
      const ctx = sp2019
        .init({
          siteUrl: siteUrl,
          authOptions: {
            username: username,
            password: password,
            domain: domain
          }
        })
      const spctx = await ctx.getContext()
      const oListsCollection: SP.ListCollection = spctx.get_web().get_lists()
      spctx.load(oListsCollection, "Include(Title)")
      await spctx.executeQueryPromise()
      const arrList:any[] = []
      const listsTitlesArr = oListsCollection.get_data().map(l => {
	arrList.push({ Title:l.get_title() })
	})
      

      console.log("List test :", arrList)
      console.log("List :", listsTitlesArr)

      console.log("TEST SHAREPOINT :", { result: "success!!!" })
	
     res.send(JSON.stringify(arrList)) 
      //res.send('🏠')
})

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

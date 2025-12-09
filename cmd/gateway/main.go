package main

import (
	"fmt"
	"log"
	"net/http"
	"zentro/internal/config"
	"zentro/internal/global"
	"zentro/internal/management"
	"zentro/internal/router"
)


func main(){
	gf:=config.ParseGatewayFlags()
	fmt.Println(config.GatewayName)
	addr:=fmt.Sprintf(":%d",gf.Port)
	adminAddr:=fmt.Sprintf(":%d",gf.AdminPort)
	gc,err:=config.MustLoadRoutes(gf.RoutesConfigPath)
	if err!=nil{
		log.Fatal("Could not load route config")
	}
	global.InitConfig(gc)
	
    go global.WatchConfigFile(gf.RoutesConfigPath)

	consumerCfg := config.MustLoadConsumers(gf.ConsumersConfigPath)
	global.InitConsumers(consumerCfg)
	go global.WatchConsumersFile(gf.ConsumersConfigPath)

	r:=router.NewRouter(gc.Routes)
	go management.ManagementServer(adminAddr)
	log.Printf("Zendor started at %d",gf.Port)
	log.Printf("Zendor Mangement started at %d",gf.AdminPort)
	err=http.ListenAndServe(addr,r)
	if err!=nil{
		log.Fatalln(err)
	}
}
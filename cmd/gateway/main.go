package main

import (
	"fmt"
	"log"
	"net/http"
	"zentro/internal/config"
	"zentro/internal/global"
	"zentro/internal/management"
	"zentro/internal/router"
	"zentro/internal/embedf"
)

func main() {
	gf := config.ParseGatewayFlags()
	fmt.Println(config.GatewayName)
	addr := fmt.Sprintf(":%d", gf.Port)
	adminAddr := fmt.Sprintf(":%d", gf.AdminPort)
	gc, err := config.MustLoadRoutes(gf.RoutesConfigPath)
	if err != nil {
		log.Fatal("Could not load route config")
	}
	global.InitConfig(gc)

	config.Init(gc.Environment)

	go global.WatchConfigFile(gf.RoutesConfigPath)
	r := router.NewRouter(gc.Routes)

	uiFS, err := embedf.GetDistFS()
	if err != nil {
		log.Fatalf("Failed to load embedded UI: %v", err)
	}

	go management.ManagementServer(adminAddr, uiFS)
	log.Printf("Zendor started at %d", gf.Port)
	log.Printf("Zendor Mangement started at %d", gf.AdminPort)
	err = http.ListenAndServe(addr, r)
	if err != nil {
		log.Fatalln(err)
	}
}

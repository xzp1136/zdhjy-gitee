  (func (;43569;) (type 7) (param i32 i32 i32 i32 i32)
    (local i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 5
    global.set 0
    i32.const 4366836
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3359088
      call 2180
      i32.const 3391524
      call 2180
      i32.const 3391532
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3369340
      call 2180
      i32.const 3462912
      call 2180
      i32.const 4366836
      i32.const 1
      i32.store8
    end
    local.get 0
    local.get 0
    i32.load offset=8
    i32.const 1
    i32.add
    i32.store offset=8
    i32.const 3360788
    i32.load
    local.tee 4
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 4
      call 60460
    end
    local.get 1
    i32.const 0
    i32.const 0
    call 48812
    if  ;; label = @1
      i32.const 3369340
      i32.load
      call 1900
      local.tee 4
      i32.const 0
      i32.store8 offset=20
      local.get 4
      local.get 3
      i32.store offset=16
      local.get 4
      local.get 2
      i32.store offset=12
      local.get 4
      local.get 1
      i32.store offset=8
      local.get 0
      i32.load offset=12
      i32.load offset=48
      local.get 4
      i32.const 3391524
      i32.load
      call 50463
      local.get 0
      i32.load offset=12
      local.get 1
      local.get 0
      call 43544
    end
    block  ;; label = @1
      local.get 0
      i32.load offset=16
      local.tee 1
      local.get 0
      i32.load offset=8
      i32.gt_s
      br_if 0 (;@1;)
      local.get 5
      local.get 1
      i32.store offset=12
      i32.const 3359088
      i32.load
      local.get 5
      i32.const 12
      i32.add
      call 2193
      local.set 1
      local.get 5
      local.get 0
      i32.load offset=8
      i32.store offset=8
      i32.const 3359088
      i32.load
      local.get 5
      i32.const 8
      i32.add
      call 2193
      local.set 4
      local.get 5
      local.get 0
      i32.load offset=12
      i32.load offset=48
      i32.load offset=12
      i32.store offset=4
      i32.const 3359088
      i32.load
      local.get 5
      i32.const 4
      i32.add
      call 2193
      local.set 0
      i32.const 3462912
      i32.load
      local.get 1
      local.get 4
      local.get 0
      i32.const 0
      call 48228
      local.set 0
      i32.const 3356428
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      local.get 0
      i32.const 0
      call 55817
      i32.const 4367477
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360984
        call 2180
        i32.const 4367477
        i32.const 1
        i32.store8
      end
      i32.const 3360984
      i32.load
      i32.load offset=92
      i32.load
      local.tee 0
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      local.get 0
      call 43418
    end
    local.get 5
    i32.const 16
    i32.add
    global.set 0)

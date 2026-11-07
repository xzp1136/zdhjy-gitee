  (func (;43447;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32)
    global.get 0
    i32.const 32
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366749
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354788
      call 2180
      i32.const 3403044
      call 2180
      i32.const 3356080
      call 2180
      i32.const 3376472
      call 2180
      i32.const 3407960
      call 2180
      i32.const 3408248
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3413772
      call 2180
      i32.const 3364124
      call 2180
      i32.const 3420048
      call 2180
      i32.const 3420108
      call 2180
      i32.const 3420144
      call 2180
      i32.const 3420152
      call 2180
      i32.const 3420172
      call 2180
      i32.const 4366749
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=60
    local.set 3
    i32.const 3360788
    i32.load
    local.tee 1
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 1
      call 60460
    end
    block  ;; label = @1
      local.get 3
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=60
      local.get 2
      i32.const 16
      i32.add
      i32.const 3408248
      i32.load
      call 45354
      local.get 2
      i32.load offset=16
      local.set 3
      i32.const 3360788
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      local.get 3
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        local.get 0
        local.get 2
        call 43448
        br 1 (;@1;)
      end
      local.get 3
      i32.const 0
      i32.const 0
      call 7821
      drop
      i32.const 3354788
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 4367468
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3354788
        call 2180
        i32.const 4367468
        i32.const 1
        i32.store8
      end
      i32.const 3354788
      i32.load
      local.tee 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 60460
        i32.const 3354788
        i32.load
      end
      i32.load offset=92
      i32.load
      local.tee 1
      if  ;; label = @2
        i32.const 0
        call 56046
        i32.load offset=52
        local.set 4
        i32.const 3376472
        i32.load
        local.set 5
        local.get 2
        i32.const 74
        i32.store offset=28
        local.get 4
        local.get 2
        i32.const 28
        i32.add
        local.get 2
        i32.const 16
        i32.add
        local.get 5
        call 34434
        local.get 1
        local.get 2
        i32.load offset=20
        i32.const 0
        call 44254
      end
      local.get 2
      local.get 0
      i32.const 0
      call 48735
      local.get 2
      call 43449
      local.get 3
      local.get 2
      i32.const 16
      i32.add
      i32.const 3403044
      i32.load
      call 45307
      local.get 2
      i32.load offset=16
      local.set 4
      i32.const 3360788
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      local.get 4
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        local.get 3
        i32.const 0
        call 48736
        i32.const 3407960
        i32.load
        call 45355
        local.set 4
      end
      local.get 4
      i32.const 0
      i32.const 0
      call 7821
      drop
      local.get 4
      f32.const 0x1p+0 (;=1;)
      i32.const 0
      call 5979
      i32.const 3356080
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 0
      call 7600
      local.tee 1
      local.get 3
      f32.const 0x1.28f5c2p+0 (;=1.16;)
      f32.const 0x1.47ae14p-3 (;=0.16;)
      i32.const 0
      call 7782
      i32.const 6
      i32.const 3420152
      i32.load
      call 14789
      i32.const 0
      call 7801
      drop
      local.get 1
      local.get 3
      f32.const 0x1p+0 (;=1;)
      f32.const 0x1.99999ap-4 (;=0.1;)
      i32.const 0
      call 7782
      i32.const 7
      i32.const 3420152
      i32.load
      call 14789
      i32.const 0
      call 7801
      drop
      local.get 2
      i64.const 4787326403894837248
      i64.store
      local.get 2
      i64.const 4787326403894837248
      i64.store offset=8
      local.get 1
      local.get 3
      local.get 2
      f32.const 0x1.5c28f6p-2 (;=0.34;)
      i32.const 0
      i32.const 0
      call 44003
      i32.const 8
      i32.const 3420144
      i32.load
      call 14789
      i32.const 0
      call 7801
      drop
      local.get 1
      local.get 4
      f32.const 0x0p+0 (;=0;)
      f32.const 0x1.1eb852p-2 (;=0.28;)
      i32.const 0
      call 43990
      f32.const 0x1.eb851ep-5 (;=0.06;)
      i32.const 3420108
      i32.load
      call 14786
      i32.const 0
      call 7802
      drop
      i32.const 3364124
      i32.load
      call 1900
      local.tee 4
      local.get 0
      i32.const 3413772
      i32.load
      i32.const 0
      call 7547
      local.get 1
      local.get 4
      i32.const 3420048
      i32.load
      call 14773
      drop
      local.get 1
      local.get 3
      i32.const 0
      call 48736
      i32.const 6
      i32.const 3420172
      i32.load
      call 14799
      drop
    end
    local.get 2
    i32.const 32
    i32.add
    global.set 0)

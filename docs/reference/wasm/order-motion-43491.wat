  (func (;43491;) (type 1) (param i32 i32)
    (local i32 i32 i32 i64)
    global.get 0
    i32.const 48
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366791
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354788
      call 2180
      i32.const 3376472
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4366791
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load8_u offset=8
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=12
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=12
      local.set 1
      local.get 0
      i32.load offset=16
      i32.load offset=60
      local.set 3
      i32.const 3360788
      i32.load
      local.tee 4
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 4
        call 60460
      end
      local.get 3
      local.get 1
      i32.const 0
      call 48812
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=16
      i32.const 0
      call 48708
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.const 1
      i32.store8 offset=8
      local.get 0
      i32.load offset=20
      local.set 1
      local.get 2
      local.get 0
      i64.load offset=24 align=4
      local.tee 5
      i64.store offset=16
      local.get 2
      local.get 5
      i64.store offset=32
      local.get 1
      local.get 2
      i32.const 16
      i32.add
      i32.const 0
      call 49438
      local.get 0
      i32.load offset=20
      local.set 1
      i32.const 4377531
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364792
        call 2180
        i32.const 4377531
        i32.const 1
        i32.store8
      end
      local.get 2
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 3
      i32.load offset=20
      i32.store offset=8
      local.get 2
      local.get 3
      i64.load offset=12 align=4
      i64.store
      local.get 1
      local.get 2
      i32.const 0
      call 49495
      local.get 0
      i32.load offset=32
      f32.const 0x1p+0 (;=1;)
      i32.const 0
      call 5979
      local.get 0
      i32.load offset=36
      local.tee 1
      if  ;; label = @2
        local.get 1
        i32.load offset=32
        local.get 1
        i32.load offset=20
        local.get 1
        i32.load offset=12
        call_indirect (type 1)
      end
      local.get 0
      i32.load offset=16
      i32.load offset=32
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48812
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=16
      local.tee 1
      i32.load8_u offset=78
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      i32.load offset=32
      i32.const 1
      i32.const 0
      call 48833
      i32.const 3354788
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      call 43450
      local.tee 1
      if  ;; label = @2
        i32.const 0
        call 56046
        i32.load offset=52
        local.set 3
        i32.const 3376472
        i32.load
        local.set 4
        local.get 2
        i32.const 66
        i32.store offset=44
        local.get 3
        local.get 2
        i32.const 44
        i32.add
        local.get 2
        i32.const 24
        i32.add
        local.get 4
        call 34434
        local.get 1
        local.get 2
        i32.load offset=28
        i32.const 0
        call 44254
      end
      local.get 0
      i32.load offset=16
      local.tee 0
      local.get 0
      local.get 0
      i32.load offset=20
      local.get 0
      call 43451
      i32.const 0
      call 48887
      drop
    end
    local.get 2
    i32.const 48
    i32.add
    global.set 0)

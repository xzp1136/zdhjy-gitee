  (func (;44287;) (type 1) (param i32 i32)
    (local i32 i32 i64)
    global.get 0
    i32.const 48
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4367380
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3357344
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4367380
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load8_u offset=96
    i32.eqz
    if  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 0
          i32.load8_u offset=108
          if  ;; label = @4
            local.get 0
            i32.const 1
            i32.store8 offset=96
            local.get 0
            i32.load8_u offset=144
            i32.eqz
            br_if 1 (;@3;)
            local.get 0
            local.get 0
            i32.load offset=148
            i32.store offset=116
            local.get 2
            i32.const 32
            i32.add
            local.get 0
            i32.const 0
            call 48735
            i32.const 0
            call 49468
            local.get 0
            local.get 2
            i64.load offset=32
            i64.store offset=120 align=4
            local.get 0
            i32.load8_u offset=108
            i32.eqz
            br_if 2 (;@2;)
            local.get 0
            i32.const 0
            i32.store8 offset=108
            local.get 0
            i32.const 1
            i32.store8 offset=128
            block  ;; label = @5
              local.get 0
              i32.load offset=164
              local.tee 1
              i32.eqz
              br_if 0 (;@5;)
              local.get 1
              i32.const 0
              call 7706
              i32.eqz
              br_if 0 (;@5;)
              local.get 0
              i32.load offset=164
              i32.const 0
              i32.const 0
              call 7683
            end
            local.get 0
            i32.const 0
            i32.store offset=164
            br 2 (;@2;)
          end
          local.get 0
          i32.const 1
          i32.store8 offset=96
        end
        local.get 0
        local.get 0
        i32.load offset=72
        i32.store offset=116
        local.get 2
        i32.const 32
        i32.add
        local.get 0
        i32.const 0
        call 48735
        i32.const 0
        call 49468
        local.get 0
        local.get 2
        i64.load offset=32
        i64.store offset=120 align=4
      end
      i32.const 3357344
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 4367474
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3357344
        call 2180
        i32.const 4367474
        i32.const 1
        i32.store8
      end
      i32.const 3357344
      i32.load
      local.tee 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 60460
        i32.const 3357344
        i32.load
      end
      i32.load offset=92
      i32.load
      local.tee 1
      if  ;; label = @2
        local.get 0
        i32.load offset=116
        local.set 3
        local.get 2
        local.get 0
        i64.load offset=120 align=4
        local.tee 4
        i64.store offset=8
        local.get 2
        local.get 4
        i64.store offset=24
        local.get 1
        local.get 0
        local.get 3
        local.get 2
        i32.const 8
        i32.add
        local.get 0
        call 44359
      end
      local.get 0
      i32.load offset=48
      local.tee 1
      if  ;; label = @2
        local.get 1
        i32.const 0
        call 40998
      end
      local.get 0
      i32.const 0
      local.get 0
      call 44360
      local.get 0
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
      block  ;; label = @2
        local.get 1
        i32.const 0
        i32.const 0
        call 48812
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        i32.load offset=32
        local.set 1
        i32.const 4377530
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3364764
          call 2180
          i32.const 4377530
          i32.const 1
          i32.store8
        end
        local.get 2
        i32.const 3364764
        i32.load
        i32.load offset=92
        i64.load align=4
        local.tee 4
        i64.store offset=16
        local.get 2
        local.get 4
        i64.store
        local.get 1
        local.get 2
        i32.const 0
        call 20369
        local.get 0
        i32.load offset=32
        f32.const 0x0p+0 (;=0;)
        i32.const 0
        call 20371
        local.get 0
        i32.load offset=32
        i32.const 0
        i32.const 0
        call 20385
        local.get 0
        i32.load8_u offset=160
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        i32.load offset=32
        local.get 0
        i32.load offset=156
        i32.const 0
        call 20378
        local.get 0
        i32.const 0
        i32.store8 offset=160
      end
      i32.const 4367385
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360788
        call 2180
        i32.const 4367385
        i32.const 1
        i32.store8
      end
      local.get 0
      i32.load offset=44
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
      if  ;; label = @2
        local.get 0
        i32.load offset=44
        i32.const 0
        i32.const 0
        call 48707
      end
      local.get 0
      local.get 0
      call 44361
    end
    local.get 2
    i32.const 48
    i32.add
    global.set 0)

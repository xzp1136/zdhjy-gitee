  (func (;41049;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32 f32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4365146
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3357344
      call 2180
      i32.const 3388080
      call 2180
      i32.const 3388084
      call 2180
      i32.const 4365146
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load offset=16
      i32.const 1
      i32.ne
      br_if 0 (;@1;)
      local.get 0
      i32.load8_u offset=40
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load8_u offset=80
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      local.get 0
      f32.load offset=76
      i32.const 0
      call 49309
      f32.add
      local.tee 6
      f32.store offset=76
      local.get 6
      f32.const 0x1p+0 (;=1;)
      f32.lt
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      i32.store offset=76
      local.get 0
      i32.load offset=60
      local.tee 1
      i32.load offset=12
      i32.const 0
      i32.gt_s
      if  ;; label = @2
        loop  ;; label = @3
          local.get 1
          local.get 4
          local.get 3
          i32.const 12
          i32.add
          i32.const 3388084
          i32.load
          call 50458
          block  ;; label = @4
            local.get 3
            i32.load offset=12
            local.tee 1
            i32.eqz
            br_if 0 (;@4;)
            local.get 1
            i32.load8_u offset=32
            i32.eqz
            br_if 0 (;@4;)
            i32.const 1
            local.set 5
            local.get 1
            i32.load8_u offset=33
            br_if 0 (;@4;)
            i32.const 3357344
            i32.load
            local.tee 2
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 2
              call 60460
            end
            i32.const 4367474
            i32.load8_u
            i32.eqz
            if  ;; label = @5
              i32.const 3357344
              call 2180
              i32.const 4367474
              i32.const 1
              i32.store8
            end
            i32.const 3357344
            i32.load
            local.tee 2
            i32.load offset=116
            if (result i32)  ;; label = @5
              local.get 2
            else
              local.get 2
              call 60460
              i32.const 3357344
              i32.load
            end
            i32.load offset=92
            i32.load
            local.get 1
            i32.load offset=20
            i32.const 0
            call 44448
            i32.const 0
            i32.gt_s
            br_if 0 (;@4;)
            local.get 1
            i32.load offset=28
            i32.eqz
            br_if 0 (;@4;)
            local.get 1
            i32.load8_u offset=33
            br_if 0 (;@4;)
            local.get 1
            i32.const 1
            i32.store8 offset=33
            i32.const 4365145
            i32.load8_u
            i32.eqz
            if  ;; label = @5
              i32.const 3367932
              call 2180
              i32.const 4365145
              i32.const 1
              i32.store8
            end
            i32.const 3367932
            i32.load
            call 1900
            local.tee 2
            local.get 0
            i32.store offset=20
            local.get 2
            i32.const 0
            i32.store offset=8
            local.get 2
            local.get 1
            i32.store offset=16
            local.get 0
            local.get 2
            i32.const 0
            call 48887
            drop
          end
          local.get 4
          i32.const 1
          i32.add
          local.tee 4
          local.get 0
          i32.load offset=60
          local.tee 1
          i32.load offset=12
          i32.lt_s
          br_if 0 (;@3;)
        end
        local.get 5
        br_if 1 (;@1;)
      end
      local.get 0
      i32.const 0
      i32.store offset=76
      local.get 0
      i32.const 0
      i32.store8 offset=80
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
